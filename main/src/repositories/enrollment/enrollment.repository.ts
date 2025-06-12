import mongoose, { Model, RootFilterQuery } from "mongoose";
import { EnrollmentDocument } from "../../models/enrollment.model";
import { BaseRepository } from "../base/base.repository";
import { IEnrollmentRepository } from "./enrollment.interface";
import { DatabaseError } from "../../util/errors/database-error";
import { StatusCode } from "../../enums/status-code.enum";
import {
  AggregatedStudentGrowth,
  Enrollment,
  EnrollmentAnalyticsResult,
  EnrollmentWithCourse,
} from "./enrollment.types";
import { inject, injectable } from "inversify";
import { PipelineStage } from "mongoose";
import { Types } from "../../container/types";

@injectable()
export class EnrollmentRepository
  extends BaseRepository<EnrollmentDocument>
  implements IEnrollmentRepository
{
  constructor(
    @inject(Types.EnrollmentModel)
    private readonly enrollmentModel: Model<EnrollmentDocument>
  ) {
    super(enrollmentModel);
  }

  async fetchAdminEnrollmentAnalytics(
    matchStage: Record<string, any>,
    dateGroup: "daily" | "monthly" | "yearly"
  ): Promise<{
    metrics: EnrollmentAnalyticsResult[];
    summary: {
      enrollmentCount: number;
    };
  }> {
    try {
      let dateFormat: string;

      switch (dateGroup) {
        case "daily":
          dateFormat = "%Y-%m-%d";
          break;
        case "monthly":
          dateFormat = "%Y-%m";
          break;
        case "yearly":
          dateFormat = "%Y";
          break;
        default:
          throw new Error("Invalid date group specified");
      }

      const pipeline: PipelineStage[] = [
        {
          $match: {
            ...matchStage,
            status: "active",
          },
        },
        {
          $group: {
            _id: {
              $dateToString: {
                format: dateFormat,
                date: "$createdAt",
              },
            },
            enrollmentCount: { $sum: 1 },
          },
        },
        {
          $sort: { _id: 1 },
        },
        {
          $project: {
            _id: 0,
            date: "$_id",
            enrollmentCount: 1,
          },
        },
      ];

      const enrollmentStats = await this.enrollmentModel
        .aggregate(pipeline)
        .exec();

      const summaryResult = await this.enrollmentModel.aggregate([
        {
          $match: { ...matchStage },
        },
        {
          $group: {
            _id: null,
            enrollmentCount: { $sum: 1 },
          },
        },
      ]);

      const summary = summaryResult[0] || { enrollmentCount: 0 };

      return { metrics: enrollmentStats ?? [], summary };
    } catch (error) {
      console.error(error);
      throw new DatabaseError(
        "An unexpected database error occurred",
        StatusCode.INTERNAL_SERVER_ERROR
      );
    }
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

      const result = await this.enrollmentModel.aggregate([
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
            "course.userId": new mongoose.Types.ObjectId(userId),
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
      const enrollments = await this.enrollmentModel.aggregate([
        { $match: { courseId: new mongoose.Types.ObjectId(courseId) } },
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
      const count = await this.enrollmentModel.countDocuments(filter);
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
      const enrolledcourse = await this.enrollmentModel
        .find({
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
      const enrollment = new this.enrollmentModel({
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
      const enrolledcourse = await this.enrollmentModel.findOne(filter).lean();
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
      const updatedEnrollment = await this.enrollmentModel.findOneAndUpdate(
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
