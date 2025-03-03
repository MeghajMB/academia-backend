import { FilterQuery } from "mongoose";
import { StatusCode } from "../enums/statusCode.enum";
import { BadRequestError } from "../errors/bad-request-error";
import { DatabaseError } from "../errors/database-error";
import { CourseModel, ICourseDocument } from "../models/courseModel";
import {
  ICourseResult,
  ICourseResultWithUserId,
} from "../types/course.interface";
import { ICourse, ICourseRepository } from "./interfaces/ICourseRepository";
import { BaseRepository } from "./base/baseRepository";

export class CourseRepository
  extends BaseRepository<ICourseDocument>
  implements ICourseRepository
{
  constructor() {
    super(CourseModel);
  }
  
  async createCourse(course: ICourse, session: object): Promise<ICourseResult> {
    try {
      const createdCourse = new CourseModel(course);
      await createdCourse.save(session);
      return createdCourse;
    } catch (error: unknown) {
      throw new DatabaseError(
        "An unexpected database error occurred",
        StatusCode.INTERNAL_SERVER_ERROR
      );
    }
  }

  async findByIdWithPopulatedData(
    courseId: string
  ): Promise<ICourseResultWithUserId | null> {
    try {
      const existingCourse = await CourseModel.findById(courseId)
        .populate("category")
        .populate("userId");
      return existingCourse as ICourseResultWithUserId | null;
    } catch (error: unknown) {
      throw new DatabaseError(
        "An unexpected database error occurred",
        StatusCode.INTERNAL_SERVER_ERROR
      );
    }
  }

  async findNewCourses(): Promise<ICourseResult[]> {
    try {
      const newCourses = await CourseModel.find({ status: "listed" })
        .populate("category")
        .sort({ createdAt: -1 })
        .limit(4);

      return newCourses;
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

  async findCoursesWithFilter(
    filter: FilterQuery<ICourseDocument>
  ): Promise<ICourseResult[] | null> {
    try {
      const courses = await CourseModel.find(filter).populate("category");
      return courses;
    } catch (error: unknown) {
      throw new DatabaseError(
        "An unexpected database error occurred",
        StatusCode.INTERNAL_SERVER_ERROR
      );
    }
  }

  async changeCourseStatusWithInstructorIdAndCourseId(
    instructorId: string,
    courseId: string,
    status: string
  ): Promise<ICourseResult | null> {
    try {
      const course = await CourseModel.findOneAndUpdate(
        { _id: courseId, userId: instructorId },
        { status: status, rejectedReason: "" },
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

  async toggleCourseStatus(courseId: string): Promise<ICourseResult | null> {
    try {
      const updatedCourse = await CourseModel.findByIdAndUpdate(
        courseId,
        [{ $set: { isBlocked: { $not: "$isBlocked" } } }], // MongoDB toggle
        { new: true }
      );

      return updatedCourse;
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
        .populate("category");

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

  async rejectCourseReviewRequest(
    courseId: string,
    rejectReason: string
  ): Promise<ICourseResult | null> {
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

  async approveCourseReviewRequest(
    courseId: string
  ): Promise<ICourseResult | null> {
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
