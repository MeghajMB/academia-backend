import mongoose from "mongoose";
import { IReviewDocument, ReviewModel } from "../../models/review.model";
import { BaseRepository } from "../base/base.repository";
import { IReviewRepository } from "../interfaces/review-repository.interface";
import { DatabaseError } from "../../util/errors/database-error";
import { StatusCode } from "../../enums/status-code.enum";
import { ReviewWithPopulatedStudentId } from "../../types/review.interface";


export class ReviewRepository
  extends BaseRepository<IReviewDocument>
  implements IReviewRepository
{
  constructor() {
    super(ReviewModel);
  }
  async createReview(reviewData: Partial<IReviewDocument>) {
    try {
      return ReviewModel.create(reviewData);
    } catch (error) {
      throw new DatabaseError(
        "An unexpected database error occurred",
        StatusCode.INTERNAL_SERVER_ERROR
      );
    }
  }

  async findReviewsByCourse(courseId: string) {
    try {
      const reviews = ReviewModel.find({ courseId }).populate("studentId");
      return reviews as unknown as ReviewWithPopulatedStudentId[];
    } catch (error) {
      throw new DatabaseError(
        "An unexpected database error occurred",
        StatusCode.INTERNAL_SERVER_ERROR
      );
    }
  }

  async findReviewsByStudent(studentId: string) {
    try {
      return ReviewModel.find({ studentId }).populate("courseId");
    } catch (error) {
      throw new DatabaseError(
        "An unexpected database error occurred",
        StatusCode.INTERNAL_SERVER_ERROR
      );
    }
  }

  async findByCourseAndStudent(courseId: string, studentId: string) {
    try {
      return ReviewModel.findOne({ courseId, studentId });
    } catch (error) {
      throw new DatabaseError(
        "An unexpected database error occurred",
        StatusCode.INTERNAL_SERVER_ERROR
      );
    }
  }

  async findReviewById(reviewId: string) {
    try {
      return ReviewModel.findById(reviewId);
    } catch (error) {
      throw new DatabaseError(
        "An unexpected database error occurred",
        StatusCode.INTERNAL_SERVER_ERROR
      );
    }
  }

  async deleteReview(reviewId: string) {
    try {
      return ReviewModel.findByIdAndDelete(reviewId);
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
      ratings: { rating: number; count: number }[];
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
      throw new DatabaseError("Something Unexpected Happened");
    }
  }
}
