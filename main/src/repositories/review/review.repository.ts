import mongoose, { Model } from "mongoose";
import { ReviewDocument } from "../../models/review.model";
import { BaseRepository } from "../base/base.repository";
import { IReviewRepository } from "./review.interface";
import { DatabaseError } from "../../util/errors/database-error";
import { StatusCode } from "../../enums/status-code.enum";
import {
  ReviewAnalyticsResult,
  ReviewWithPopulatedCourseId,
  ReviewWithPopulatedStudentId,
} from "./review.types";
import { UserDocument } from "../../models/user.model";
import { inject, injectable } from "inversify";
import { CourseDocument } from "../../models/course.model";
import { Types } from "../../container/types";

@injectable()
export class ReviewRepository
  extends BaseRepository<ReviewDocument>
  implements IReviewRepository
{
  constructor(
    @inject(Types.ReviewModel)
    private readonly reviewModel: Model<ReviewDocument>
  ) {
    super(reviewModel);
  }

  async fetchAdminReviewAnalytics(
    matchStage: Record<string, any>,
    dateGroup: "daily" | "monthly" | "yearly"
  ): Promise<ReviewAnalyticsResult[]> {
    try {
      const result = await this.reviewModel.aggregate([
        { $match: { ...matchStage } },
        {
          $group: {
            _id: "$rating",
            count: { $sum: 1 },
          },
        },
        {
          $group: {
            _id: null,
            totalReviews: { $sum: "$count" },
            averageRating: { $avg: "$_id" },
            ratings: {
              $push: {
                rating: "$_id",
                count: "$count",
              },
            },
          },
        },
      ]);
      return result;
    } catch (error) {
      console.error(error);
      throw new DatabaseError(
        "An unexpected database error occurred",
        StatusCode.INTERNAL_SERVER_ERROR
      );
    }
  }

  async findReviewsByCourse(
    courseId: string
  ): Promise<ReviewWithPopulatedStudentId[]> {
    try {
      const reviews = this.reviewModel
        .find({ courseId })
        .populate("studentId")
        .lean();
      return reviews as unknown as ReviewWithPopulatedStudentId[];
    } catch (error) {
      throw new DatabaseError(
        "An unexpected database error occurred",
        StatusCode.INTERNAL_SERVER_ERROR
      );
    }
  }

  async findReviewsByStudent(
    studentId: string
  ): Promise<ReviewWithPopulatedCourseId[]> {
    try {
      const review = await this.reviewModel
        .find({ studentId })
        .populate<{ courseId: CourseDocument }>("courseId")
        .lean();
      return review;
    } catch (error) {
      throw new DatabaseError(
        "An unexpected database error occurred",
        StatusCode.INTERNAL_SERVER_ERROR
      );
    }
  }

  async findByCourseAndStudent(
    courseId: string,
    studentId: string
  ): Promise<ReviewWithPopulatedStudentId | null> {
    try {
      return this.reviewModel
        .findOne({ courseId, studentId })
        .populate<{ studentId: UserDocument }>("studentId")
        .lean();
    } catch (error) {
      console.log(error);
      throw new DatabaseError(
        "An unexpected database error occurred",
        StatusCode.INTERNAL_SERVER_ERROR
      );
    }
  }

  async findReviewById(reviewId: string) {
    try {
      return this.reviewModel.findById(reviewId).lean();
    } catch (error) {
      throw new DatabaseError(
        "An unexpected database error occurred",
        StatusCode.INTERNAL_SERVER_ERROR
      );
    }
  }

  async getCourseReviewStats(courseId: string): Promise<
    {
      totalReviews: number;
      averageRating: number;
      ratings: { rating: 1 | 2 | 3 | 4 | 5; count: number }[];
    }[]
  > {
    try {
      return this.reviewModel.aggregate([
        { $match: { courseId: new mongoose.Types.ObjectId(courseId) } },
        {
          $group: {
            _id: "$rating",
            count: { $sum: 1 },
          },
        },
        {
          $group: {
            _id: null,
            totalReviews: { $sum: "$count" },
            averageRating: { $avg: "$_id" },
            ratings: {
              $push: {
                rating: "$_id",
                count: "$count",
              },
            },
          },
        },
      ]);
    } catch (error) {
      console.log(error);
      throw new DatabaseError(
        "An unexpected database error occurred",
        StatusCode.INTERNAL_SERVER_ERROR
      );
    }
  }
}
