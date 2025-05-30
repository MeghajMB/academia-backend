import mongoose from "mongoose";
import { ReviewDocument, ReviewModel } from "../../models/review.model";
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
import { injectable } from "inversify";
import { CourseDocument } from "../../models/course.model";

@injectable()
export class ReviewRepository
  extends BaseRepository<ReviewDocument>
  implements IReviewRepository
{
  constructor() {
    super(ReviewModel);
  }

  async fetchAdminReviewAnalytics(
    matchStage: Record<string, any>,
    dateGroup: "daily" | "monthly" | "yearly"
  ): Promise<ReviewAnalyticsResult[]> {
    try {
      const result = await ReviewModel.aggregate([
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
      const reviews = ReviewModel.find({ courseId })
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
      const review = await ReviewModel.find({ studentId })
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
      return ReviewModel.findOne({ courseId, studentId })
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
      return ReviewModel.findById(reviewId).lean();
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
      return ReviewModel.aggregate([
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
