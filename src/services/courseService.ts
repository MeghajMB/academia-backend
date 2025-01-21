// src/services/CourseService.ts
import { CourseRepository } from "../repositories/courseRepository";
import { AppError } from "../errors/app-error";
import { BadRequestError } from "../errors/bad-request-error";
import { CourseDocument } from "../models/courseModel";
import { CurriculumRepository } from "../repositories/curriculumRepository";
import { ICourse } from "../repositories/interfaces/courseRepository";
import mongoose from "mongoose";

export class CourseService {
  constructor(
    private courseRepository: CourseRepository,
    private curriculumRepository: CurriculumRepository
  ) {}

  async createCourse(
    courseData: ICourse,
    userId: string
  ): Promise<CourseDocument> {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const data = { ...courseData, userId: userId };
      const newCourse = await this.courseRepository.createCourse(data, {
        session,
      });
      if (!newCourse) {
        throw new BadRequestError("Course Creation Failed");
      }
      await this.curriculumRepository.createCurriculum({ courseId: newCourse._id, sections: [] },{session})
      await session.commitTransaction();
      session.endSession();
      return newCourse;
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  }
}
