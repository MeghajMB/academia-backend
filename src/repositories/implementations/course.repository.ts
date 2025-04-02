import { FilterQuery } from "mongoose";
import { StatusCode } from "../../enums/status-code.enum";
import { CourseModel, CourseDocument } from "../../models/course.model";
import { BaseRepository } from "../base/base.repository";
import { ICourseRepository } from "../interfaces/course-repository.interface";
import { DatabaseError } from "../../util/errors/database-error";
import { CourseWithPopulatedFields } from "../types/course-repository.types";

export class CourseRepository
  extends BaseRepository<CourseDocument>
  implements ICourseRepository
{
  constructor() {
    super(CourseModel);
  }

  async createCourseWithSession(
    course: Partial<CourseDocument>,
    session: object
  ): Promise<CourseDocument> {
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
  ): Promise<CourseWithPopulatedFields | null> {
    try {
      const existingCourse = await CourseModel.findById(courseId)
        .populate("category")
        .populate("userId")
        .lean();
      return existingCourse as CourseWithPopulatedFields | null;
    } catch (error: unknown) {
      throw new DatabaseError(
        "An unexpected database error occurred",
        StatusCode.INTERNAL_SERVER_ERROR
      );
    }
  }

  async findNewCourses(): Promise<CourseDocument[]> {
    try {
      const newCourses = await CourseModel.find({ status: "listed" })
        .populate("category")
        .sort({ createdAt: -1 })
        .limit(4)
        .lean();

      return newCourses;
    } catch (error: unknown) {
      throw new DatabaseError(
        "An unexpected database error occurred",
        StatusCode.INTERNAL_SERVER_ERROR
      );
    }
  }

  async findCourseByName(title: string): Promise<CourseDocument | null> {
    try {
      const existingCourse = await CourseModel.findOne({ title: title }).lean();
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
  ): Promise<CourseDocument[] | null> {
    try {
      const courses = await CourseModel.find({
        userId: instructorId,
        status: status,
      }).lean();
      return courses;
    } catch (error: unknown) {
      throw new DatabaseError(
        "An unexpected database error occurred",
        StatusCode.INTERNAL_SERVER_ERROR
      );
    }
  }

  async findCoursesWithFilter(
    filter: FilterQuery<CourseDocument>
  ): Promise<CourseDocument[] | null> {
    try {
      const courses = await CourseModel.find(filter).lean();
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
  ): Promise<CourseDocument | null> {
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
      const count = await CourseModel.countDocuments({ [key]: value });

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

  async toggleCourseStatus(courseId: string): Promise<CourseDocument | null> {
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
  ): Promise<CourseDocument[]> {
    try {
      const courses = await CourseModel.find(filters)
        .skip(skip)
        .limit(limit)
        .lean();

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
  ): Promise<CourseDocument | null> {
    try {
      const updatedCourse = await CourseModel.findByIdAndUpdate(
        courseId,
        { $set: { status: "rejected", rejectedReason: rejectReason } },
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

  async approveCourseReviewRequest(
    courseId: string
  ): Promise<CourseDocument | null> {
    try {
      const updatedCourse = await CourseModel.findByIdAndUpdate(
        courseId,
        { $set: { status: "accepted" }, $unset: { rejectedReason: "" } },
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
}
