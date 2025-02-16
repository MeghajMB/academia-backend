import { StatusCode } from "../enums/statusCode.enum";
import { BadRequestError } from "../errors/bad-request-error";
import { DatabaseError } from "../errors/database-error";
import { CourseModel } from "../models/courseModel";
import { ICourseResult } from "../types/course.interface";
import { ICourse, ICourseRepository } from "./interfaces/ICourseRepository";

export class CourseRepository implements ICourseRepository {
  async createCourse(course: ICourse, session: object): Promise<ICourseResult> {
    try {
      const createdCourse = new CourseModel(course);
      const savedCourse = await createdCourse.save(session);
      return savedCourse;
    } catch (error: unknown) {
      throw new DatabaseError(
        "An unexpected database error occurred",
        StatusCode.INTERNAL_SERVER_ERROR
      );
    }
  }
  async findById(courseId: string): Promise<ICourseResult | null> {
    try {
      const existingCourse = await CourseModel.findById(courseId);
      return existingCourse;
    } catch (error: unknown) {
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
      );

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
  async countDocuments(key: string, value: string): Promise<number> {
    try {
      const count = await CourseModel.countDocuments({ key: value });

      return count;
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
  async fetchPaginatedCoursesWithFilters(
    filters: { [key: string]: any },
    skip: number,
    limit: number
  ): Promise<ICourseResult[]> {
    try {
      const courses = await CourseModel.find(filters)
        .skip(skip)
        .limit(limit)
        .populate('category')

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
  async rejectCourseReviewRequest(courseId: string,rejectReason:string): Promise<ICourseResult | null> {
    try {
      const course = await CourseModel.findById(courseId);
      if (!course) {
        throw new BadRequestError("Course Not Found");
      }
      course.status = "rejected";
      course.rejectedReason = rejectReason;
      await course.save();
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
  async approveCourseReviewRequest(courseId: string): Promise<ICourseResult | null> {
    try {
      const course = await CourseModel.findById(courseId);
      if (!course) {
        throw new BadRequestError("Course Not Found");
      }
      course.status = "accepted";
      delete (course as any).rejected;
      await course.save();
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
