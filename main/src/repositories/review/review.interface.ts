import { ReviewDocument } from "../../models/review.model";
import { IRepository } from "../base/base.interface";
import { ReviewAnalyticsResult, ReviewWithPopulatedCourseId, ReviewWithPopulatedStudentId } from "./review.types";

export interface IReviewRepository extends IRepository<ReviewDocument> {
  fetchAdminReviewAnalytics(
  matchStage: Record<string, any>,
  dateGroup: "daily" | "monthly" | "yearly"
): Promise<ReviewAnalyticsResult[]>
  findReviewsByCourse(
    courseId: string
  ): Promise<ReviewWithPopulatedStudentId[]>;
  findReviewsByStudent(studentId: string): Promise<ReviewWithPopulatedCourseId[]>;
  findByCourseAndStudent(
    courseId: string,
    studentId: string
  ): Promise<ReviewWithPopulatedStudentId | null>;
  findReviewById(reviewId: string): Promise<ReviewDocument | null>;
  getCourseReviewStats(courseId: string): Promise<
    {
      totalReviews: number;
      averageRating: number;
      ratings: { rating: 1 | 2 | 3 | 4 | 5; count: number }[];
    }[]| []
  >;
}
