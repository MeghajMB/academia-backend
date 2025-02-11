// src/services/CourseService.ts
import { CourseRepository } from "../repositories/courseRepository";
import { BadRequestError } from "../errors/bad-request-error";
import { CurriculumRepository } from "../repositories/curriculumRepository";
import { ICourse } from "../repositories/interfaces/courseRepository";
import mongoose from "mongoose";
import { ICourseResult, ICurriculumResult } from "../types/courseInterface";

export class CourseService {
  constructor(
    private courseRepository: CourseRepository,
    private curriculumRepository: CurriculumRepository
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
}
