// src/services/CourseService.ts
import { BadRequestError } from "../errors/bad-request-error";
import { ICourseRepository } from "../repositories/interfaces/ICourseRepository";
import mongoose from "mongoose";
import { ICourseResult } from "../types/course.interface";
import { SendMessageCommand } from "@aws-sdk/client-sqs";
import { sqsClient } from "../util/awsClient";
import { FileService } from "./fileService";
import { AppError } from "../errors/app-error";
import { StatusCode } from "../enums/statusCode.enum";
import { CloudfrontSignedCookiesOutput } from "@aws-sdk/cloudfront-signer";
import {
  ICourseService,
  ICreateCourse,
  ICurriculumResult,
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

export class CourseService implements ICourseService {
  constructor(
    private courseRepository: ICourseRepository,
    private lectureRepository: ILectureRepository,
    private sectionRepository: ISectionRepository,
    private fileService: FileService
  ) {}

  async createCourse(
    courseData: ICreateCourse,
    userId: string
  ): Promise<ICourseResult | void> {
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

  async getCurriculum(courseId: string): Promise<IUpdatedSection[]> {
    const sections = await this.sectionRepository.getSectionsWithCourseId(
      courseId
    );
    if (sections.length == 0) {
      throw new BadRequestError("No course");
    }
    const lectures = await this.lectureRepository.getLecturesWithCourseId(
      courseId
    );
    if (lectures.length == 0) {
      throw new BadRequestError("No course");
    }

    const curriculum = sections.map((section) => ({
      id: (section._id as mongoose.ObjectId).toString(),
      courseId: section.courseId.toString(),
      title: section.title,
      order: section.order,
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
        })),
    }));

    return curriculum;
  }

  async getCurriculumOfInstructor(
    courseId: string,
    userId: string
  ): Promise<IUpdatedSection[]> {
    const existingCourse = await this.courseRepository.findById(courseId);
    if (existingCourse?.userId.toString() !== userId) {
      throw new AppError(
        "You dont have access to this file",
        StatusCode.FORBIDDEN
      );
    }

    const sections = await this.sectionRepository.getSectionsWithCourseId(
      courseId
    );
    const lectures = await this.lectureRepository.getLecturesWithCourseId(
      courseId
    );
    const curriculum = sections.map((section) => ({
      id: (section._id as mongoose.ObjectId).toString(),
      courseId: section.courseId.toString(),
      title: section.title,
      order: section.order,
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
        })),
    }));

    return curriculum;
  }

  async getCourseOfInstructor(
    instructorId: string,
    status: string
  ): Promise<ICourseResult[]> {
    if (
      status !== "pending" &&
      status !== "accepted" &&
      status !== "rejected" &&
      status !== "draft"
    ) {
      throw new BadRequestError("enter a valid status");
    }
    const course =
      await this.courseRepository.fetchCoursesWithInstrucorIdAndStatus(
        instructorId,
        status
      );
    if (!course) {
      throw new BadRequestError("No course");
    }
    return course;
  }

  async submitCourseForReview(
    instructorId: string,
    courseId: string
  ): Promise<{ message: string }> {
    try {
      const course = await this.courseRepository.submitCourseForReview(
        instructorId,
        courseId
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
    const section = await this.sectionRepository.create(updatedSectionData);
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

    const newLecture = await this.lectureRepository.create(updatedLectureData);
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

  async generateLecturePreviewLectureUrl(
    courseId: string,
    lectureId: string,
    userId: string,
    role: string
  ): Promise<{
    signedCookies: CloudfrontSignedCookiesOutput;
    url: string;
  }> {
    try {
      const existingCourse = await this.courseRepository.findById(courseId);

      if (!existingCourse) {
        throw new BadRequestError("Course not found");
      }
      if (role !== "admin" && existingCourse.userId!.toString() !== userId) {
        throw new AppError(
          "You dont have access to this file",
          StatusCode.FORBIDDEN
        );
      }

      const existingLecture = await this.lectureRepository.findById(lectureId);
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
