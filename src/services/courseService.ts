// src/services/CourseService.ts
import { BadRequestError } from "../errors/bad-request-error";
import { ICourseRepository } from "../repositories/interfaces/ICourseRepository";
import mongoose from "mongoose";
import {
  ICourseResult,
  ICourseResultWithUserId,
} from "../types/course.interface";
import { SendMessageCommand } from "@aws-sdk/client-sqs";
import { sqsClient } from "../util/awsClient";
import { FileService } from "./fileService";
import { AppError } from "../errors/app-error";
import { StatusCode } from "../enums/statusCode.enum";
import { CloudfrontSignedCookiesOutput } from "@aws-sdk/cloudfront-signer";
import {
  ICourseService,
  ICreateCourse,
  IGetCourseDetails,
  IUpdatedSection,
} from "./interfaces/ICourseService";
import {
  ILectureRepository,
  ILectureResult,
} from "../repositories/interfaces/ILectureRepository";
import {
  ISectionRepository,
  ISectionResult,
} from "../repositories/interfaces/ISectionRepository";
import { IEnrollmentRepository } from "../repositories/interfaces/IEnrollmentRepository";
import { IEnrollmentDocument } from "../models/enrollmentModel";
import { IUserRepository } from "../repositories/interfaces/IUserRepository";
import { ICourseDocument } from "../models/courseModel";
import { ILectureDocument } from "../models/lectureModel";
import moment from "moment";
import { ISectionDocument } from "../models/sectionModel";

export class CourseService implements ICourseService {
  constructor(
    private courseRepository: ICourseRepository,
    private lectureRepository: ILectureRepository,
    private sectionRepository: ISectionRepository,
    private enrollmentRepository: IEnrollmentRepository,
    private userRepository: IUserRepository,
    private fileService: FileService
  ) {}

  async createCourse(
    courseData: ICreateCourse,
    userId: string
  ): Promise<ICourseResult> {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const existingCourse = await this.courseRepository.findCourseByName(
        courseData.title
      );
      if (existingCourse) {
        throw new BadRequestError("Course Already Exists");
      }
      const updatedCourseData = { ...courseData, userId };
      const newCourse = await this.courseRepository.createCourse(
        updatedCourseData,
        {
          session,
        }
      );

      if (!newCourse) {
        throw new BadRequestError("Course Creation Failed");
      }
      await session.commitTransaction();
      session.endSession();
      return newCourse;
    } catch (error) {
      // Rollback the transaction
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  }

  async changeOrderOfLecture(
    draggedLectureId: string,
    targetLectureId: string,
    id: string
  ): Promise<unknown> {
    if (draggedLectureId == targetLectureId) {
      return { message: "success" };
    }
    const draggedLecture =
      await this.lectureRepository.findByIdWithPopulatedData(draggedLectureId);
    const targetLecture =
      await this.lectureRepository.findByIdWithPopulatedData(targetLectureId);
    if (
      !draggedLecture ||
      !targetLecture ||
      draggedLecture.courseId.userId.toString() !== id ||
      targetLecture.courseId.userId.toString() !== id
    ) {
      throw new BadRequestError("No lecture");
    }

    if (
      draggedLecture.sectionId.toString() == targetLecture.sectionId.toString()
    ) {
      await this.lectureRepository.updateOrderOfLectureInSameSection(
        draggedLecture.sectionId,
        draggedLecture._id as mongoose.ObjectId,
        draggedLecture.order,
        targetLecture.order
      );
    } else {
      await this.lectureRepository.updateOrderOfLectureInDifferentSection(
        draggedLecture._id as mongoose.ObjectId,
        draggedLecture.sectionId,
        targetLecture.sectionId,
        draggedLecture.order,
        targetLecture.order
      );
    }

    return { message: "success" };
  }

  async editLecture(
    lectureId: string,
    lectureData: { title: string; videoUrl: string; duration: number },
    id: string
  ): Promise<ILectureResult> {
    try {
      const updatedLectures = await this.lectureRepository.editLecture(
        lectureId,
        lectureData
      );
      if (!updatedLectures) {
        throw new BadRequestError("Bad request");
      }
      return updatedLectures;
    } catch (error) {
      throw error;
    }
  }

  async editSection(
    sectionId: string,
    sectionData: { title: string; description: string },
    instructorId: string
  ): Promise<ISectionResult> {
    try {
      const existingSection =
        await this.sectionRepository.findByIdWithPopulatedData(sectionId);
      if (
        !existingSection ||
        existingSection.courseId.userId.toString() !== instructorId
      ) {
        throw new BadRequestError("Something happened");
      }
      const updatedLectures = await this.sectionRepository.update(
        sectionId,
        sectionData
      );
      if (!updatedLectures) {
        throw new BadRequestError("Bad request");
      }
      return updatedLectures;
    } catch (error) {
      throw error;
    }
  }
  //write code for generating certificate and updating the status to completed
  async markLectureAsCompleted(
    id: string,
    courseId: string,
    lectureId: string
  ): Promise<{ message: string } | null> {
    try {
      const enrollment = await this.enrollmentRepository.findOneByFilter({
        studentId: id,
        courseId,
      });

      if (!enrollment) {
        throw new AppError("Enrollment not found", StatusCode.NOT_FOUND);
      }

      if (!enrollment.progress.completedLectures.includes(lectureId)) {
        const totalLectures =
          await this.lectureRepository.getTotalLecturesOfCourse(courseId);
        const completedLecturesCount =
          enrollment.progress.completedLectures.length + 1;
        const progressPercentage = Math.round(
          (completedLecturesCount / totalLectures) * 100
        );

        // Fetch course once to get instructor (avoid redundant DB calls)
        const course = await this.courseRepository.findByIdWithPopulatedData(
          String(enrollment.courseId)
        );
        if (!course) {
          throw new BadRequestError("Not Found");
        }
        // Track whether coins should be awarded
        let awarded50Percent = enrollment.progress.awarded50Percent;
        let awarded100Percent = enrollment.progress.awarded100Percent;
        let coinsToAward = 0;

        // Award coins only if they haven't been awarded before
        if (progressPercentage >= 50 && !awarded50Percent) {
          coinsToAward += 1;
          awarded50Percent = true;
        }
        if (progressPercentage === 100 && !awarded100Percent) {
          coinsToAward += 2;
          awarded100Percent = true;
          await this.enrollmentRepository.update(enrollment.id, {
            completedAt: new Date(),
          });
        }

        // Update enrollment progress and award status in a single call
        await this.enrollmentRepository.updateEnrollmentProgress(
          enrollment,
          lectureId,
          progressPercentage,
          awarded50Percent,
          awarded100Percent
        );

        // Award purple coins if applicable
        if (coinsToAward > 0) {
          await this.userRepository.awardPurpleCoins(
            String(course.userId),
            coinsToAward
          );
        }
      }

      return { message: "Enrollment Updated" };
    } catch (error) {
      throw error;
    }
  }

  async enrollStudent(
    courseId: string,
    userId: string,
    transactionId: string,
    session: mongoose.mongo.ClientSession
  ): Promise<IEnrollmentDocument> {
    try {
      const listedCourse =
        await this.enrollmentRepository.createEnrollmentWithSession(
          courseId,
          userId,
          transactionId,
          session
        );
      return listedCourse;
    } catch (error) {
      throw error;
    }
  }

  async getCourseDetails(
    courseId: string,
    userId: string
  ): Promise<IGetCourseDetails> {
    try {
      const course = await this.courseRepository.findByIdWithPopulatedData(
        courseId
      );

      if (!course || course.status !== "listed") {
        throw new BadRequestError("No course");
      }

      let enrollmentStatus;

      const enrolledCourse = await this.enrollmentRepository.findOneByFilter({
        courseId,
        studentId: userId,
      });

      if (course.userId.id == userId || enrolledCourse) {
        enrollmentStatus = "enrolled";
      } else {
        enrollmentStatus = "not enrolled";
      }

      const image = await this.fileService.generateGetSignedUrl(
        course.imageThumbnail
      );
      const video = await this.fileService.generateGetSignedUrl(
        course.promotionalVideo
      );

      const courseDetails = {
        courseId: course._id as string,
        instructorId: course.userId.id,
        instructorName: course.userId.name,
        totalDuration: course.totalDuration,
        totalLectures: course.totalLectures,
        imageThumbnail: image,
        promotionalVideo: video,
        canReview: !!enrolledCourse,
        hasReviewed: !!enrolledCourse?.reviewStatus,
        category: course.category.name,
        title: course.title,
        price: course.price,
        subtitle: course.subtitle,
        description: course.description,
        enrollmentStatus: enrollmentStatus as "enrolled" | "not enrolled",
      };

      return courseDetails;
    } catch (error) {
      throw error;
    }
  }

  async editCourseCreationDetails(
    courseId: string,
    userId: string,
    courseData: ICreateCourse
  ): Promise<ICourseResult> {
    try {
      const course = await this.courseRepository.findById(courseId);

      if (!course) {
        throw new BadRequestError("No course");
      }
      if (course.userId.toString() !== userId) {
        throw new AppError(
          "You dont havve acces to this file",
          StatusCode.FORBIDDEN
        );
      }
      let updatedData: {
        category: mongoose.Types.ObjectId;
        description: string;
        price: number;
        subtitle: string;
        title: string;
        imageThumbnail?: string;
        promotionalVideo?: string;
      } = {
        category: new mongoose.Types.ObjectId(courseData.category),
        description: courseData.description,
        price: courseData.price,
        subtitle: courseData.subtitle,
        title: courseData.title,
      };

      if (courseData.imageThumbnail) {
        updatedData.imageThumbnail = courseData.imageThumbnail;
      }
      if (courseData.promotionalVideo) {
        updatedData.imageThumbnail = courseData.promotionalVideo;
      }
      const updatedCourse = await this.courseRepository.update(
        courseId,
        updatedData as unknown as Partial<ICourseDocument>
      );

      return updatedCourse;
    } catch (error) {
      throw error;
    }
  }

  async getCourseCreationDetails(
    courseId: string,
    userId: string
  ): Promise<{
    courseId: string;
    imageThumbnail: string;
    promotionalVideo: string;
    category: string;
    title: string;
    price: number;
    subtitle: string;
    description: string;
  }> {
    const course = await this.courseRepository.findByIdWithPopulatedData(
      courseId
    );

    if (!course) {
      throw new BadRequestError("No course");
    }
    if (course.userId.id !== userId) {
      throw new AppError(
        "You dont havve acces to this file",
        StatusCode.FORBIDDEN
      );
    }
    const sectionCount = await this.sectionRepository.countDocumentsByCourseId(
      courseId
    );
    const image = await this.fileService.generateGetSignedUrl(
      course.imageThumbnail
    );
    const video = await this.fileService.generateGetSignedUrl(
      course.promotionalVideo
    );

    const courseDetails = {
      courseId: course._id as string,
      imageThumbnail: image,
      promotionalVideo: video,
      category: course.category.id as string,
      title: course.title,
      price: course.price,
      subtitle: course.subtitle,
      description: course.description,
      rejectedReason: course.rejectedReason,
      canSubmitReview: sectionCount
        ? course.status !== "listed" && course.status !== "pending"
          ? true
          : false
        : false,
    };

    return courseDetails;
  }

  async getNewCourses(): Promise<ICourseResult[]> {
    try {
      const courses = await this.courseRepository.findNewCourses();
      if (!courses) {
        throw new BadRequestError("No new courses available");
      }

      await Promise.all(
        courses.map(async (course) => {
          course.imageThumbnail = await this.fileService.generateGetSignedUrl(
            course.imageThumbnail
          );
        })
      );
      return courses;
    } catch (error) {
      throw error;
    }
  }

  async getEnrolledCoursesOfUser(studentId: string): Promise<any> {
    try {
      const enrolledCourses = await this.enrollmentRepository.findByStudentId(
        studentId
      );
      let updatedEnrolledCourses = await Promise.all(
        enrolledCourses.map(async (enrolledCourse) => {
          let imageUrl = await this.fileService.generateGetSignedUrl(
            enrolledCourse.courseId.imageThumbnail
          );
          return {
            id: enrolledCourse.courseId.id,
            imageThumbnail: imageUrl,
            title: enrolledCourse.courseId.title,
            completedAt: enrolledCourse.completedAt,
            progressPercentage: enrolledCourse.progress.percentage,
            certificate: enrolledCourse.certificateUrl,
          };
        })
      );

      return updatedEnrolledCourses;
    } catch (error) {
      throw error;
    }
  }

  async getCurriculum(
    courseId: string,
    userId: string,
    status: string,
    role: string
  ): Promise<IUpdatedSection[]> {
    try {
      const existingCourse = await this.courseRepository.findById(courseId);

      if (status == "instructor") {
        if (existingCourse?.userId.toString() !== userId) {
          throw new AppError(
            "You dont have access to this file",
            StatusCode.FORBIDDEN
          );
        }
      }
      let enrolledCourse: IEnrollmentDocument | null;
      if (status == "student" && existingCourse?.userId.toString() !== userId) {
        enrolledCourse = await this.enrollmentRepository.findOneByFilter({
          courseId: courseId,
          studentId: userId,
        });

        if (!enrolledCourse) {
          throw new AppError(
            "You dont have access to this course",
            StatusCode.FORBIDDEN
          );
        }
      }
      const sections = await this.sectionRepository.getSectionsWithCourseId(
        courseId
      );

      const lectures = await this.lectureRepository.getLecturesWithCourseId(
        courseId
      );
      //change the lecture and sections to curriculum
      const curriculum = sections.map((section) => ({
        id: (section._id as mongoose.ObjectId).toString(),
        courseId: section.courseId.toString(),
        title: section.title,
        order: section.order,
        description: section.description,
        lectures: lectures
          .filter(
            (lecture) =>
              lecture.sectionId.toString() ===
              (section._id as mongoose.ObjectId).toString()
          )
          .map((lecture) => ({
            id: (lecture._id as mongoose.ObjectId).toString(),
            sectionId: lecture.sectionId.toString(),
            courseId: lecture.courseId.toString(),
            title: lecture.title,
            videoUrl: lecture.videoUrl,
            duration: lecture.duration,
            order: lecture.order,
            status: lecture.status,
            progress:
              status == "instructor"
                ? "instructor"
                : enrolledCourse?.progress.completedLectures.includes(
                    (lecture._id as mongoose.ObjectId).toString()
                  )
                ? "completed"
                : "not completed",
          })),
      }));

      return curriculum;
    } catch (error) {
      throw error;
    }
  }

  async getCoursesOfInstructor(
    instructorId: string,
    status: string
  ): Promise<ICourseResult[]> {
    if (
      status !== "pending" &&
      status !== "accepted" &&
      status !== "rejected" &&
      status !== "draft" &&
      status !== "all"
    ) {
      throw new BadRequestError("enter a valid status");
    }
    let filter: { userId: string; status?: string } = { userId: instructorId };

    if (status !== "all") {
      filter.status = status;
    }

    const course = await this.courseRepository.findCoursesWithFilter(filter);

    if (!course) {
      throw new BadRequestError("No course");
    }
    return course;
  }

  async deleteLecture(
    instructorId: string,
    lectureId: string
  ): Promise<{ message: string; status: "archived" | "deleted" }> {
    try {
      const lecture = await this.lectureRepository.findByIdWithPopulatedData(
        lectureId
      );
      if (lecture?.courseId.userId.toString() !== instructorId) {
        throw new AppError(
          "Youd dont have the necessary permissions",
          StatusCode.FORBIDDEN
        );
      }
      if (lecture.courseId.status === "listed") {
        const scheduledDeletionDate = moment().add(30, "days").toDate();
        await this.lectureRepository.update(lectureId, {
          status: "archived",
          scheduledDeletionDate,
        });
      } else {
        await this.lectureRepository.delete(lectureId);
      }

      return {
        message: "success",
        status: lecture.courseId.status === "listed" ? "archived" : "deleted",
      };
    } catch (error) {
      throw error;
    }
  }

  async deleteSection(
    instructorId: string,
    sectionId: string
  ): Promise<{ message: string; status: "archived" | "deleted" }> {
    try {
      const section = await this.sectionRepository.findByIdWithPopulatedData(
        sectionId
      );
      if (section?.courseId.userId.toString() !== instructorId) {
        throw new AppError(
          "Youd dont have the necessary permissions",
          StatusCode.FORBIDDEN
        );
      }
      if (section.courseId.status === "listed") {
        const scheduledDeletionDate = moment().add(30, "days").toDate();
        await this.lectureRepository.scheduleDeletionDateForLectures(
          sectionId,
          scheduledDeletionDate
        );
      } else {
        await this.lectureRepository.deleteLecturesByFilter({ sectionId });
      }

      return {
        message: "success",
        status: section.courseId.status === "listed" ? "archived" : "deleted",
      };
    } catch (error) {
      throw error;
    }
  }

  async submitCourseForReview(
    instructorId: string,
    courseId: string
  ): Promise<{ message: string }> {
    try {
      const status = "pending";
      const course =
        await this.courseRepository.changeCourseStatusWithInstructorIdAndCourseId(
          instructorId,
          courseId,
          status
        );
      if (!course) {
        throw new BadRequestError("No course");
      }
      return { message: "success" };
    } catch (error) {
      throw error;
    }
  }

  async listCourse(
    instructorId: string,
    courseId: string
  ): Promise<{ message: string }> {
    try {
      const status = "listed";
      const existingCourse = await this.courseRepository.findById(courseId);
      if (existingCourse?.status !== "accepted") {
        throw new BadRequestError("The course is not approved");
      }
      if (existingCourse?.userId.toString() !== instructorId) {
        throw new AppError(
          "You dont have access to this course",
          StatusCode.FORBIDDEN
        );
      }
      const course =
        await this.courseRepository.changeCourseStatusWithInstructorIdAndCourseId(
          instructorId,
          courseId,
          status
        );
      if (!course) {
        throw new BadRequestError("No course");
      }
      return { message: "success" };
    } catch (error) {
      throw error;
    }
  }

  async addSection(
    sectionData: { title: string; description: string; order: string },
    courseId: string,
    userId: string
  ): Promise<ISectionResult> {
    const course = await this.courseRepository.findById(courseId); // assuming you have a repository for courses
    if (!course || course.userId.toString() !== userId) {
      throw new BadRequestError("Course not found");
    }
    const sectionCount = await this.sectionRepository.countDocumentsByCourseId(
      courseId
    );

    const updatedSectionData = {
      ...sectionData,
      courseId,
      order: sectionCount,
    };
    const section = await this.sectionRepository.create(
      updatedSectionData as unknown as Partial<ISectionDocument>
    );
    if (!section) {
      throw new BadRequestError("No course");
    }
    return section;
  }

  async addLecture(
    userId: string,
    courseId: string,
    sectionId: string,
    lectureData: { title: string; videoUrl: string; duration: number }
  ): Promise<ILectureResult> {
    const existingCourse = await this.courseRepository.findById(courseId);

    if (existingCourse?.userId.toString() !== userId) {
      throw new BadRequestError("You dont have access to this course");
    }
    const lectureCount =
      await this.lectureRepository.countDocumentWithSectionId(sectionId);
    const updatedLectureData = {
      ...lectureData,
      sectionId,
      courseId,
      duration: Math.ceil(lectureData.duration / 60),
      order: lectureCount,
    };

    const newLecture = await this.lectureRepository.create(
      updatedLectureData as unknown as Partial<ILectureDocument>
    );
    //send an event to sqs
    const params = {
      MessageBody: JSON.stringify({
        event: "add-lecture",
        data: {
          userId: userId,
          courseId: courseId,
          sectionId: sectionId,
          lectureId: newLecture._id,
          key: lectureData.videoUrl,
          bucketName: process.env.AWS_TEMP_BUCKET_NAME,
        },
      }),
      QueueUrl: process.env.AWS_S3_QUEUE_URL,
      DelaySeconds: 0, // Optional: Delay for the message (in seconds)
    };

    const command = new SendMessageCommand(params);
    await sqsClient.send(command);

    return newLecture;
  }

  async addLectureAfterProcessing(
    userId: string,
    courseId: string,
    sectionId: string,
    lectureId: string,
    key: string
  ): Promise<Boolean | void> {
    try {
      const newLecture =
        await this.lectureRepository.updateLectureWithProcessedKey(
          lectureId,
          key
        );

      if (!newLecture) {
        throw new BadRequestError("Lecture not found");
      }
      return true;
    } catch (error) {
      throw error;
    }
  }

  async generateLectureUrl(
    courseId: string,
    lectureId: string,
    userId: string,
    role: string
  ): Promise<{
    signedCookies: CloudfrontSignedCookiesOutput;
    url: string;
  }> {
    try {
      const existingCourse =
        await this.courseRepository.findByIdWithPopulatedData(courseId);

      if (!existingCourse) {
        throw new BadRequestError("Course not found");
      }
      if (role !== "admin" && existingCourse.userId!.id.toString() !== userId) {
        const enrolledCourse = await this.enrollmentRepository.findOneByFilter({
          studentId: userId,
          courseId,
        });
        if (!enrolledCourse) {
          throw new AppError(
            "You dont have access to this file",
            StatusCode.FORBIDDEN
          );
        }
      }

      const existingLecture =
        await this.lectureRepository.findByIdWithPopulatedData(lectureId);
      if (!existingLecture) {
        throw new BadRequestError("Lecture not found");
      }

      const videoKey = existingLecture.videoUrl;
      const signedCookies =
        await this.fileService.generateCloudFrontGetSignedCookies(videoKey);
      const url = `${process.env.CLOUDFRONT_DOMAIN}/${videoKey}`;
      return { signedCookies, url };
    } catch (error) {
      throw error;
    }
  }
}
