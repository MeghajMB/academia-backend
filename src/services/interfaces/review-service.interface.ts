import { ReviewDocument } from "../../models/review.model";
import {
  CreateReviewParams,
  ReviewsWithStats,
} from "../types/review-service.types";

export interface IReviewService {
  addReview(
    reviewData: CreateReviewParams,
    studentId: string
  ): Promise<ReviewDocument>;

  getReviewsByCourse(courseId: string): Promise<ReviewsWithStats>;

  getReviewsByStudent(studentId: string): Promise<ReviewDocument[]>;

  deleteReview(reviewId: string, studentId: string): Promise<void>;
}
