// src/services/CourseService.ts
import { CourseRepository } from "../repositories/courseRepository";
import { BadRequestError } from "../errors/bad-request-error";
import { CurriculumRepository } from "../repositories/curriculumRepository";
import { ICourse } from "../repositories/interfaces/courseRepository";
import mongoose from "mongoose";
import { ICourseResult, ICurriculumResult } from "../types/courseInterface";
import { SendMessageCommand } from "@aws-sdk/client-sqs";
import { sqsClient } from "../util/awsClient";
import { FileService } from "./fileService";
import { AppError } from "../errors/app-error";
import { StatusCode } from "../enums/statusCode.enum";
import { CloudfrontSignedCookiesOutput } from "@aws-sdk/cloudfront-signer";

export class CourseService {
  constructor(
    private courseRepository: CourseRepository,
    private curriculumRepository: CurriculumRepository,
    private fileService: FileService
  ) {}

  async createCourse(
    courseData: ICourse,
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

      const newCourse = await this.courseRepository.createCourse(courseData, {
        session,
      });

      if (!newCourse) {
        throw new BadRequestError("Course Creation Failed");
      }
      const curriculum = await this.curriculumRepository.createCurriculum(
        { userId: userId, courseId: newCourse.id, sections: [] },
        { session }
      );
      if (!curriculum) {
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
  async getCurriculum(courseId: string): Promise<ICurriculumResult | void> {
    const curriculum = await this.curriculumRepository.getCurriculum(courseId);
    if (!curriculum) {
      throw new BadRequestError("No course");
    }
    return curriculum;
  }

  async getCourseOfInstructor(instructorId: string,status:string): Promise<ICourseResult[] > {
    if(status!=='pending' && status!=='accepted' && status!=='rejected' && status!=='notRequested'){
      throw new BadRequestError("enter a valid status")
    }
    const course = await this.courseRepository.fetchCoursesWithInstrucorIdAndStatus(instructorId,status);
    if (!course) {
      throw new BadRequestError("No course");
    }
    return course;
  }
  async submitCourseForReview(instructorId: string,courseId:string): Promise<ICourseResult > {

    const course = await this.courseRepository.submitCourseForReview(instructorId,courseId);
    if (!course) {
      throw new BadRequestError("No course");
    }
    return course;
  }

  async createSection(
    courseId: string,
    section: { title: string; description: string }
  ): Promise<ICurriculumResult> {
    const curriculum = await this.curriculumRepository.addSectionToCurriculum(
      courseId,
      section
    );
    if (!curriculum) {
      throw new BadRequestError("No course");
    }
    return curriculum;
  }
  async addLecture(
    courseId: string,
    sectionId: string,
    lectureData: { title: string; content: string }
  ): Promise<{
    id: string;
    title: string;
    content: string;
  }> {
    const updatedCurriculum =
      await this.curriculumRepository.addLectureToCurriculum(
        courseId,
        sectionId,
        lectureData
      );
    if (!updatedCurriculum) {
      throw new BadRequestError("Error adding lecture");
    }
    const addedLecture = updatedCurriculum.sections
      .filter((section) => "" + section._id == sectionId)[0]
      .lectures.pop();

    const updatedLecture = {
      id: "" + addedLecture!._id,
      title: addedLecture!.title,
      content: addedLecture!.content,
      status: "processing",
    };
    //send an event to sqs
    const params = {
      MessageBody: JSON.stringify({
        event: "add-lecture",
        data: {
          userId: updatedCurriculum.userId,
          courseId: courseId,
          sectionId: sectionId,
          lectureId: updatedLecture.id,
          key: lectureData.content,
          bucketName: process.env.AWS_TEMP_BUCKET_NAME,
        },
      }),
      QueueUrl: process.env.AWS_S3_QUEUE_URL,
      DelaySeconds: 0, // Optional: Delay for the message (in seconds)
    };

    const command = new SendMessageCommand(params);
    await sqsClient.send(command);

    return updatedLecture;
  }

  async addLectureAfterProcessing(
    userId: string,
    courseId: string,
    sectionId: string,
    lectureId: string,
    key: string
  ): Promise<Boolean | void> {
    try {
      const curriculum =
        await this.curriculumRepository.updateLectureWithProcessedKey(
          userId,
          courseId,
          sectionId,
          lectureId,
          key
        );

      if (!curriculum) {
        throw new BadRequestError("Curriculum not found");
      }
      return true;
    } catch (error) {
      throw error;
    }
  }
  async generateLecturePreviewLectureUrl(
    courseId: string,
    sectionId: string,
    lectureId: string,
    userId: string,
    role: string
  ): Promise<{
    signedCookies: CloudfrontSignedCookiesOutput;
    url: string;
  } > {
    try {
      const curriculum = await this.curriculumRepository.getCurriculum(
        courseId
      );

      if (!curriculum) {
        throw new BadRequestError("Curriculum not found");
      }
      if (curriculum.userId.toString() !== userId) {
        throw new AppError(
          "You dont have access to this file",
          StatusCode.FORBIDDEN
        );
      }
      const section = curriculum.sections.find(
        (section) => section._id!.toString() == sectionId
      );
      const lecture = section?.lectures.find(
        (lecture) => lecture._id!.toString() == lectureId
      );
      const videoKey = lecture?.content!;
      const signedCookies =
        await this.fileService.generateCloudFrontGetSignedCookies(videoKey);
        const url = `${process.env.CLOUDFRONT_DOMAIN}/${videoKey}`;
      return { signedCookies, url };
    } catch (error) {
      throw error;
    }
  }
}
