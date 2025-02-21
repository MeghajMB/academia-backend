import mongoose from "mongoose";
import { ReviewModel } from "../models/reviewModel";
import { ReviewDocument } from "../models/reviewModel";
import { DatabaseError } from "../errors/database-error";
import { StatusCode } from "../enums/statusCode.enum";

export class ReviewRepository {
  async createReview(reviewData: Partial<ReviewDocument>) {
    return ReviewModel.create(reviewData);
  }

  async findReviewsByCourse(courseId: string) {
    try {
      const reviews = ReviewModel.find({ courseId }).populate(
        "studentId",
        "name"
      );
      return reviews;
    } catch (error) {
      throw new DatabaseError(
        "An unexpected database error occurred",
        StatusCode.INTERNAL_SERVER_ERROR
      );
    }
  }

  async findReviewsByStudent(studentId: string) {
    return ReviewModel.find({ studentId }).populate("courseId", "title");
  }

  async findByCourseAndStudent(courseId: string, studentId: string) {
    return ReviewModel.findOne({ courseId, studentId });
  }

  async findReviewById(reviewId: string) {
    return ReviewModel.findById(reviewId);
  }

  async deleteReview(reviewId: string) {
    return ReviewModel.findByIdAndDelete(reviewId);
  }

  async getAverageRating(courseId: string) {
    const result = await ReviewModel.aggregate([
      { $match: { courseId: new mongoose.Types.ObjectId(courseId) } },
      {
        $group: {
          _id: "$courseId",
          averageRating: { $avg: "$rating" },
          totalReviews: { $sum: 1 },
        },
      },
    ]);

    return result.length ? result[0] : { averageRating: 0, totalReviews: 0 };
  }
}
