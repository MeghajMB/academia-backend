import { StatusCode } from "../enums/statusCode.enum";
import { DatabaseError } from "../errors/database-error";
import { CourseModel } from "../models/courseModel";
import { ICourseResult, ICurriculumResult } from "../types/courseInterface";
import { ICourse, ICourseRepository } from "./interfaces/courseRepository";

export class CourseRepository implements ICourseRepository {
  async createCourse(course: ICourse, session: object): Promise<ICourseResult> {
    try {
      const createdCourse = new CourseModel(course);
      const savedCourse = await createdCourse.save(session);
      return savedCourse;
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.log(error.message);
      }
      throw new DatabaseError(
        "An unexpected database error occurred",
        StatusCode.INTERNAL_SERVER_ERROR
      );
    }
  }
  async findCourseByName(title: string): Promise<ICourseResult | null> {
    try {
      const existingCourse = await CourseModel.findOne({ title: title });
      return existingCourse;
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.log(error.message);
      }
      throw new DatabaseError(
        "An unexpected database error occurred",
        StatusCode.INTERNAL_SERVER_ERROR
      );
    }
  }
  async fetchCoursesWithInstrucorIdAndStatus(
    instructorId: string,
    status: string
  ): Promise<ICourseResult[] | null> {
    try {
      const courses = await CourseModel.find({
        userId: instructorId,
        status: status,
      }).populate("category");
      return courses;
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.log(error.message);
      }
      throw new DatabaseError(
        "An unexpected database error occurred",
        StatusCode.INTERNAL_SERVER_ERROR
      );
    }
  }

  async submitCourseForReview(
    instructorId: string,
    courseId: string
  ): Promise<ICourseResult | null> {
    try {
      const course = await CourseModel.findOneAndUpdate(
        { _id: courseId, userId: instructorId },
        { status: "pending" },
        { new: true }
      ).populate("category");

      return course;

    } catch (error: unknown) {
      if (error instanceof Error) {
        console.log(error.message);
      }
      throw new DatabaseError(
        "An unexpected database error occurred",
        StatusCode.INTERNAL_SERVER_ERROR
      );
    }
  }
}
