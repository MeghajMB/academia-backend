import { BadRequestError } from "../../util/errors/bad-request-error";
import { ICourseRepository } from "../../repositories/course/course.interface";
import mongoose, { Types } from "mongoose";
import { SendMessageCommand } from "@aws-sdk/client-sqs";
import { sqsClient } from "../../lib/awsClient";
import { FileService } from "../file/file.service";
import { AppError } from "../../util/errors/app-error";
import { StatusCode } from "../../enums/status-code.enum";
import { CloudfrontSignedCookiesOutput } from "@aws-sdk/cloudfront-signer";
import { ICourseService } from "./course.interface";
import { ILectureRepository } from "../../repositories/lecture/lecture.interface";
import { ISectionRepository } from "../../repositories/section/section.interface";
import { IEnrollmentRepository } from "../../repositories/enrollment/enrollment.interface";
import { IUserRepository } from "../../repositories/user/user.interface";
import moment from "moment";
import { CourseDocument } from "../../models/course.model";
import { LectureDocument } from "../../models/lecture.model";
import { EnrollmentDocument } from "../../models/enrollment.model";
import {
  CreateCourse,
  EditCourseLandingPagePayload,
  GetCourseCreationDetailsResponse,
  GetCourseDetailsResponse,
  GetCourses,
  GetCoursesOfInstructorResponse,
  GetEnrolledCoursesOfUserResponse,
  UpdatedSection,
} from "./course.types";
import { Enrollment } from "../../repositories/enrollment/enrollment.types";
import { GetCoursesRequestDTO } from "../../controllers/dtos/course/request.dto";
import { IReviewRepository } from "../../repositories/review/review.interface";

export class CourseService implements ICourseService {
  constructor(
    private courseRepository: ICourseRepository,
    private lectureRepository: ILectureRepository,
    private sectionRepository: ISectionRepository,
    private enrollmentRepository: IEnrollmentRepository,
    private userRepository: IUserRepository,
    private fileService: FileService,
    private reviewRepository: IReviewRepository
  ) {}

  async createCourse(
    courseData: CreateCourse,
    userId: string
  ): Promise<{ id: string }> {
    try {
      const existingCourse = await this.courseRepository.findCourseByName(
        courseData.title
      );
      if (existingCourse) {
        throw new BadRequestError("Course Already Exists");
      }
      const updatedCourseData = {
        ...courseData,
        userId: new Types.ObjectId(userId),
        category: new Types.ObjectId(courseData.category),
      };
      const newCourse = await this.courseRepository.create(updatedCourseData);

      if (!newCourse) {
        throw new BadRequestError("Course Creation Failed");
      }
      return { id: newCourse._id.toString() };
    } catch (error) {
      throw error;
    }
  }

  async getCourses({
    limit,
    category,
    page = "1",
    search,
    sort,
  }: GetCoursesRequestDTO): Promise<GetCourses> {
    try {
      const pageNum = parseInt(page) || 1;
      const skip = (pageNum - 1) * limit;

      const query: Record<any, any> = { status: "listed" };
      const sortQuery: Record<any, any> = {};
      if (category) {
        query.category = category;
      }
      if (search) {
        query.title = { $regex: search, $options: "i" };
      }
      switch (sort) {
        case "price:high":
          sortQuery.price = -1;
          break;
        case "price:low":
          sortQuery.price = 1;
          break;

        default:
          sortQuery.createdAt = -1;
          break;
      }
      const courses = await this.courseRepository.findAllPaginatedCourses({
        query,
        skip,
        sort: sortQuery,
        limit,
      });
      const totalDocuments = await this.courseRepository.countDocuments(
        "status",
        "listed"
      );
      const pagination = {
        totalDocuments,
        totalPages: Math.ceil(totalDocuments / limit),
        currentPage: Number(page),
        limit,
      };
      await Promise.all(
        courses.map(async (course) => {
          course.imageThumbnail = await this.fileService.generateGetSignedUrl(
            course.imageThumbnail
          );
        })
      );

      const updatedCourses = courses.map((course) => {
        return {
          id: course._id.toString(),
          instructorDetails: {
            name: course.user.name,
            id: course.user._id.toString(),
          },
          title: course.title,
          price: course.price,
          subtitle: course.subtitle,
          rating: course.averageRating,
          category: {
            name: course.category.name,
            id: course.category._id.toString(),
          },
          totalDuration: course.totalDuration,
          totalLectures: course.totalLectures,
          totalSections: course.totalSections,
          totalReviews: course.totalReviews,
          isBlocked: course.isBlocked,
          status: course.status,
          imageThumbnail: course.imageThumbnail,
          createdAt: course.createdAt.toISOString(),
          updatedAt: course.updatedAt.toISOString(),
        };
      });

      return {
        courses: updatedCourses,
        pagination,
      };
    } catch (error) {
      throw error;
    }
  }

  async changeOrderOfLecture(
    draggedLectureId: string,
    targetLectureId: string,
    id: string
  ): Promise<{ message: "success" }> {
    try {
      if (draggedLectureId == targetLectureId) {
        return { message: "success" };
      }
      const draggedLecture =
        await this.lectureRepository.findByIdWithPopulatedData(
          draggedLectureId
        );
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
        draggedLecture.sectionId.toString() ==
        targetLecture.sectionId.toString()
      ) {
        await this.lectureRepository.updateOrderOfLectureInSameSection(
          draggedLecture.sectionId,
          draggedLecture._id as Types.ObjectId,
          draggedLecture.order,
          targetLecture.order
        );
      } else {
        await this.lectureRepository.updateOrderOfLectureInDifferentSection(
          draggedLecture._id as Types.ObjectId,
          draggedLecture.sectionId,
          targetLecture.sectionId,
          draggedLecture.order,
          targetLecture.order
        );
      }

      return { message: "success" };
    } catch (error) {
      throw error;
    }
  }

  async editLecture(
    lectureId: string,
    lectureData: { title: string; videoUrl: string; duration: number },
    id: string
  ): Promise<{ message: "success" }> {
    try {
      const updatedLecture = await this.lectureRepository.editLecture(
        lectureId,
        lectureData
      );
      if (!updatedLecture) {
        throw new BadRequestError("Bad request");
      }
      return { message: "success" };
    } catch (error) {
      throw error;
    }
  }

  async editSection(
    sectionId: string,
    sectionData: { title: string; description: string },
    instructorId: string
  ): Promise<{ id: string }> {
    try {
      const existingSection =
        await this.sectionRepository.findByIdWithPopulatedData(sectionId);
      if (
        !existingSection ||
        existingSection.courseId.userId.toString() !== instructorId
      ) {
        throw new BadRequestError("Something happened");
      }
      const updatedSection = await this.sectionRepository.update(
        sectionId,
        sectionData,
        {}
      );
      if (!updatedSection) {
        throw new BadRequestError("Bad request");
      }
      return { id: updatedSection._id.toString() };
    } catch (error) {
      throw error;
    }
  }
  //write code for generating certificate and updating the status to completed
  async markLectureAsCompleted(
    id: string,
    courseId: string,
    lectureId: string
  ): Promise<{ message: "Enrollment Updated" }> {
    try {
      const enrollment = await this.enrollmentRepository.findOneByFilter({
        studentId: id,
        courseId,
      });

      if (!enrollment) {
        throw new AppError("Enrollment not found", StatusCode.NOT_FOUND);
      }

      if (
        !enrollment.progress.completedLectures.includes(
          new Types.ObjectId(lectureId)
        )
      ) {
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
        let coinsToAward = 0,
          goldCoinsToAward = 0;

        // Award coins only if they haven't been awarded before
        if (progressPercentage >= 50 && !awarded50Percent) {
          coinsToAward += 1;
          goldCoinsToAward += 50;
          awarded50Percent = true;
        }
        if (progressPercentage === 100 && !awarded100Percent) {
          coinsToAward += 2;
          goldCoinsToAward += 100;
          awarded100Percent = true;
          await this.enrollmentRepository.update(
            enrollment._id.toString(),
            {
              completedAt: new Date(),
            },
            {}
          );
        }
        if (goldCoinsToAward) {
          await this.userRepository.addGoldCoins(id, goldCoinsToAward);
        }
        // Update enrollment progress and award status in a single call
        await this.enrollmentRepository.updateEnrollmentProgress(
          enrollment._id.toString(),
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
    transactionId: string
  ): Promise<EnrollmentDocument> {
    try {
      const listedCourse = await this.enrollmentRepository.create({
        courseId: new Types.ObjectId(courseId),
        studentId: new Types.ObjectId(userId),
        transactionId: new Types.ObjectId(transactionId),
      });
      return listedCourse;
    } catch (error) {
      throw error;
    }
  }

  async getCourseDetails(
    courseId: string,
    userId: string
  ): Promise<GetCourseDetailsResponse> {
    try {
      const course = await this.courseRepository.findByIdWithPopulatedData(
        courseId
      );

      if (!course || course.status !== "listed") {
        throw new BadRequestError("No course");
      }

      let enrollmentStatus: "enrolled" | "instructor" | "not enrolled";

      const enrolledCourse = await this.enrollmentRepository.findOneByFilter({
        courseId,
        studentId: userId,
      });
      const userReview = await this.reviewRepository.findByCourseAndStudent(
        course._id.toString(),
        userId
      );
      const hasReviewed = userReview ? true : false;
      if (course.userId._id.toString() == userId) {
        enrollmentStatus = "instructor";
      } else if (enrolledCourse) {
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
      const sections = await this.sectionRepository.getSectionsWithCourseId(
        course._id.toString()
      );
      const lectures = await this.lectureRepository.getLecturesWithCourseId(
        course._id.toString()
      );

      const updatedSections = sections.map((section) => {
        return {
          id: section._id.toString(),
          title: section.title,
          order: section.order,
          lectures: lectures
            .filter(
              (lecture) =>
                lecture.sectionId.toString() == section._id.toString()
            )
            .map((lecture) => {
              return {
                id: lecture._id.toString(),
                title: lecture.title,
                order: lecture.order,
              };
            }),
        };
      });

      const courseDetails = {
        courseId: course._id.toString(),
        instructorId: course.userId._id.toString(),
        instructorName: course.userId.name,
        totalDuration: course.totalDuration,
        totalLectures: course.totalLectures,
        imageThumbnail: image,
        promotionalVideo: video,
        canReview: !!enrolledCourse,
        hasReviewed: hasReviewed,
        category: course.category.name,
        title: course.title,
        price: course.price,
        subtitle: course.subtitle,
        description: course.description,
        enrollmentStatus: enrollmentStatus,
        sections: updatedSections,
      };

      return courseDetails;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async editCourseCreationDetails(
    courseId: string,
    userId: string,
    courseData: EditCourseLandingPagePayload
  ): Promise<CourseDocument> {
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
        updatedData,
        {}
      );

      return updatedCourse;
    } catch (error) {
      throw error;
    }
  }

  async getCourseCreationDetails(
    courseId: string,
    userId: string
  ): Promise<GetCourseCreationDetailsResponse> {
    const course = await this.courseRepository.findByIdWithPopulatedData(
      courseId
    );

    if (!course) {
      throw new BadRequestError("No course");
    }
    if (course.userId._id.toString() !== userId) {
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
      courseId: course._id.toString(),
      imageThumbnail: image,
      promotionalVideo: video,
      category: course.category._id.toString(),
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

  async getNewCourses(): Promise<
    {
      id: string;
      userId: string;
      title: string;
      price: number;
      subtitle: string;
      description: string;
      category: {
        description: string;
        name: string;
      };
      totalDuration: number;
      totalLectures: number;
      totalSections: number;
      isBlocked: boolean;
      status: string;
      imageThumbnail: string;
      createdAt: string;
      updatedAt: string;
    }[]
  > {
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
      const updatedCourse = courses.map((course) => {
        return {
          id: course._id.toString(),
          userId: course.userId.toString(),
          title: course.title,
          price: course.price,
          subtitle: course.subtitle,
          description: course.description,
          category: {
            description: course.category.description,
            name: course.category.name,
          },
          totalDuration: course.totalDuration,
          totalLectures: course.totalLectures,
          totalSections: course.totalSections,
          isBlocked: course.isBlocked,
          status: course.status,
          imageThumbnail: course.imageThumbnail,
          createdAt: course.createdAt.toISOString(),
          updatedAt: course.updatedAt.toISOString(),
        };
      });
      return updatedCourse;
    } catch (error) {
      throw error;
    }
  }

  async getEnrolledCoursesOfUser(
    studentId: string
  ): Promise<GetEnrolledCoursesOfUserResponse[]> {
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
            id: enrolledCourse.courseId._id.toString(),
            imageThumbnail: imageUrl,
            title: enrolledCourse.courseId.title,
            completedAt: enrolledCourse.completedAt?.toISOString() || null,
            progressPercentage: enrolledCourse.progress.percentage,
            certificate: enrolledCourse.certificateUrl || null,
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
  ): Promise<UpdatedSection[]> {
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
      let enrolledCourse: Enrollment | null;
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
        id: section._id.toString(),
        courseId: section.courseId.toString(),
        title: section.title,
        order: section.order,
        description: section.description,
        lectures: lectures
          .filter(
            (lecture) => lecture.sectionId.toString() === section._id.toString()
          )
          .map((lecture) => ({
            id: lecture._id.toString(),
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
                    lecture._id as Types.ObjectId
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
  ): Promise<GetCoursesOfInstructorResponse[]> {
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

    const courses = await this.courseRepository.findCoursesWithFilter(filter);

    const updatedCourses = courses.map((course) => {
      return {
        id: course._id.toString(),
        userId: course.userId.toString(),
        title: course.title,
        price: course.price,
        subtitle: course.subtitle,
        description: course.description,
        category: {
          description: course.category.description,
          name: course.category.name,
        },
        totalDuration: course.totalDuration,
        totalLectures: course.totalLectures,
        totalSections: course.totalSections,
        isBlocked: course.isBlocked,
        status: course.status,
        rejectedReason: course.rejectedReason,
        imageThumbnail: course.imageThumbnail,
        promotionalVideo: course.promotionalVideo,
        createdAt: course.createdAt.toISOString(),
        updatedAt: course.updatedAt.toISOString(),
      };
    });

    return updatedCourses;
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
        await this.lectureRepository.update(
          lectureId,
          {
            status: "archived",
            scheduledDeletionDate,
          },
          {}
        );
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
        await this.sectionRepository.delete(sectionId);
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
  ): Promise<{
    id: string;
    courseId: string;
    title: string;
    order: number;
    description: string;
  }> {
    const course = await this.courseRepository.findById(courseId); // assuming you have a repository for courses
    if (!course || course.userId.toString() !== userId) {
      throw new BadRequestError("Course not found");
    }
    const sectionCount = await this.sectionRepository.countDocumentsByCourseId(
      courseId
    );
    const updatedSectionData = {
      ...sectionData,
      courseId: new Types.ObjectId(courseId),
      order: sectionCount,
    };
    const section = await this.sectionRepository.create(updatedSectionData);
    //update total count of section in course
    await this.courseRepository.update(
      courseId,
      {
        totalSections: sectionCount + 1,
      },
      {}
    );
    return {
      id: section._id.toString(),
      courseId: section.courseId.toString(),
      title: section.title,
      order: section.order,
      description: section.description,
    };
  }

  async addLecture(
    userId: string,
    courseId: string,
    sectionId: string,
    lectureData: { title: string; videoUrl: string; duration: number }
  ): Promise<LectureDocument> {
    const existingCourse = await this.courseRepository.findById(courseId);

    if (existingCourse?.userId.toString() !== userId) {
      throw new BadRequestError("You dont have access to this course");
    }
    const lectureCount =
      await this.lectureRepository.countDocumentWithSectionId(sectionId);

    const updatedLectureData = {
      ...lectureData,
      sectionId: new Types.ObjectId(sectionId),
      courseId: new Types.ObjectId(courseId),
      duration: Math.ceil(lectureData.duration / 60),
      order: lectureCount,
    };

    const newLecture = await this.lectureRepository.create(updatedLectureData);
    //update total cuont of lectures in course
    await this.courseRepository.update(
      courseId,
      {
        totalLectures: existingCourse.totalLectures + 1,
        totalDuration: updatedLectureData.duration,
      },
      {}
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
      if (
        role !== "admin" &&
        existingCourse.userId!._id.toString() !== userId
      ) {
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
