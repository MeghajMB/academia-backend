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
  ): Promise<AddReviewResponse>;

  getReviewsByCourse(courseId: string): Promise<ReviewsWithStats>;

  getReviewsByStudent(studentId: string): Promise<
    {
      id: string;
      courseId: string;
      rating: number;
      studentId: string;
      comment: string;
      createdAt: string;
    }[]
  >;

  deleteReview(reviewId: string, studentId: string): Promise<void>;
}
