import mongoose, { RootFilterQuery, Types } from "mongoose";
import {
  EnrollmentModel,
  EnrollmentDocument,
} from "../../models/enrollment.model";
import { BaseRepository } from "../base/base.repository";
import { IEnrollmentRepository } from "./enrollment.interface";
import { DatabaseError } from "../../util/errors/database-error";
import { StatusCode } from "../../enums/status-code.enum";
import {
  AggregatedStudentGrowth,
  Enrollment,
  EnrollmentWithCourse,
} from "./enrollment.types";

export class EnrollmentRepository
  extends BaseRepository<EnrollmentDocument>
  implements IEnrollmentRepository
{
  constructor() {
    super(EnrollmentModel);
  }
  async getStudentGrowth(
    userId: string,
    filter: "quarter" | "month" | "year",
    start: Date,
    end: Date
  ): Promise<AggregatedStudentGrowth[] | []> {
    try {
      let dateFormat: string;
      switch (filter) {
        case "month":
          dateFormat = "%Y-%m-%d"; // Daily data
          break;
        case "quarter":
          // Will group by week (ISO week number)
          dateFormat = "%G-%V"; // ISO year-week
          break;
        case "year":
          dateFormat = "%Y-%m"; // Monthly data
          break;
      }

      const result = await EnrollmentModel.aggregate([
        {
          $match: {
            purchaseDate: { $gte: start, $lte: end },
          },
        },
        {
          $lookup: {
            from: "courses",
            localField: "courseId",
            foreignField: "_id",
            as: "course",
          },
        },
        { $unwind: "$course" },
        {
          $match: {
            "course.userId": new Types.ObjectId(userId),
          },
        },
        {
          $group: {
            _id: {
              date: {
                $dateToString: { format: dateFormat, date: "$purchaseDate" },
              },
            },
            count: { $sum: 1 },
          },
        },
        {
          $project: {
            _id: 0,
            date: "$_id.date",
            count: 1,
          },
        },
        {
          $sort: {
            date: 1,
          },
        },
      ]);

      return result;
    } catch (error) {
      console.log(error);
      throw new DatabaseError(
        "An unexpected database error occurred",
        StatusCode.INTERNAL_SERVER_ERROR
      );
    }
  }
  async getEnrollmentMetrics(courseId: string): Promise<EnrollmentDocument[]> {
    try {
      const enrollments = await EnrollmentModel.aggregate([
        { $match: { courseId: new Types.ObjectId(courseId) } },
        {
          $group: {
            _id: "$courseId",
            count: { $sum: 1 },
            avgProgress: { $avg: "$progress.percentage" },
          },
        },
      ]);
      return enrollments;
    } catch (error) {
      throw new DatabaseError(
        "An unexpected database error occurred",
        StatusCode.INTERNAL_SERVER_ERROR
      );
    }
  }
  async countWithFilter(
    filter: RootFilterQuery<EnrollmentDocument> | undefined
  ): Promise<number> {
    try {
      const count = await EnrollmentModel.countDocuments(filter);
      return count;
    } catch (error) {
      throw new DatabaseError(
        "An unexpected database error occurred",
        StatusCode.INTERNAL_SERVER_ERROR
      );
    }
  }

  async findByStudentId(studentId: string): Promise<EnrollmentWithCourse[]> {
    try {
      const enrolledcourse = await EnrollmentModel.find({
        studentId,
      })
        .populate("courseId")
        .lean();
      return enrolledcourse as unknown as EnrollmentWithCourse[];
    } catch (error) {
      throw new DatabaseError(
        "An unexpected database error occurred",
        StatusCode.INTERNAL_SERVER_ERROR
      );
    }
  }

  async createEnrollmentWithSession(
    courseId: string,
    userId: string,
    transactionId: string,
    session: mongoose.mongo.ClientSession
  ): Promise<EnrollmentDocument> {
    try {
      const enrollment = new EnrollmentModel({
        courseId,
        studentId: userId,
        transactionId,
      });
      await enrollment.save({ session });
      return enrollment;
    } catch (error) {
      throw new DatabaseError(
        "An unexpected database error occurred",
        StatusCode.INTERNAL_SERVER_ERROR
      );
    }
  }

  async findOneByFilter(
    filter: Partial<Record<keyof EnrollmentDocument, any>>
  ): Promise<Enrollment | null> {
    try {
      const enrolledcourse = await EnrollmentModel.findOne(filter).lean();
      return enrolledcourse as Enrollment | null;
    } catch (error) {
      throw new DatabaseError(
        "An unexpected database error occurred",
        StatusCode.INTERNAL_SERVER_ERROR
      );
    }
  }

  async updateEnrollmentProgress(
    enrollmentId: string,
    lectureId: string,
    progressPercentage: number,
    awarded50Percent: boolean,
    awarded100Percent: boolean
  ): Promise<EnrollmentDocument | null> {
    try {
      const updatedEnrollment = await EnrollmentModel.findOneAndUpdate(
        { _id: enrollmentId },
        {
          $push: { "progress.completedLectures": lectureId },
          "progress.percentage": progressPercentage,
          "progress.awarded50Percent": awarded50Percent,
          "progress.awarded100Percent": awarded100Percent,
        },
        { new: true }
      );
      return updatedEnrollment;
    } catch (error) {
      throw new DatabaseError(
        "An unexpected database error occurred",
        StatusCode.INTERNAL_SERVER_ERROR
      );
    }
  }
}
