import { ReviewDocument } from "../../models/review.model";
import {
  AddReviewResponse,
  CreateReviewParams,
  ReviewsWithStats,
} from "./review.types";

export interface IReviewService {
  addReview(
    reviewData: CreateReviewParams,
    studentId: string
  ):Promise<AddReviewResponse>;

  getReviewsByCourse(courseId: string): Promise<ReviewsWithStats>;

  getReviewsByStudent(studentId: string): Promise<ReviewDocument[]>;

  deleteReview(reviewId: string, studentId: string): Promise<void>;
}
