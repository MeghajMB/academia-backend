import { StatusCode } from "../../enums/status-code.enum";
import { AppError } from "../../util/errors/app-error";
import { BadRequestError } from "../../util/errors/bad-request-error";
import { ReviewRepository } from "../../repositories/implementations/review.repository";
import { ICourseRepository } from "../../repositories/interfaces/course-repository.interface";
import { IEnrollmentRepository } from "../../repositories/interfaces/enrollment-repository.interface";
import { IReviewService } from "../interfaces/review-service.interface";
import {
  RatingBreakDown,
  ReviewsWithStats,
} from "../types/review-service.types";

export class ReviewService implements IReviewService {
  constructor(
    private reviewRepository: ReviewRepository,
    private enrollmentRepository: IEnrollmentRepository,
    private courseRepository: ICourseRepository
  ) {}

  async addReview(
    reviewData: { courseId: string; rating: number; comment: string },
    studentId: string
  ) {
    // Check if student has already reviewed the course
    const existingReview = await this.reviewRepository.findByCourseAndStudent(
      reviewData.courseId,
      studentId
    );

    if (existingReview) {
      const newReview = await this.reviewRepository.update(
        existingReview.id,
        {
          rating: reviewData.rating,
          comment: reviewData.comment,
        },
        {}
      );
      return newReview;
    }

    // Check if student has completed the course
    const enrollment = await this.enrollmentRepository.findOneByFilter({
      courseId: reviewData.courseId,
      studentId: studentId,
      status: "active",
    });

    if (!enrollment) {
      throw new BadRequestError("You are not enrolled in this course");
    }

    // Mark reviewStatus as true to prevent multiple reviews
    await this.enrollmentRepository.update(
      enrollment._id.toString(),
      { reviewStatus: true },
      {}
    );

    // Create review
    return this.reviewRepository.create({
      ...reviewData,
      studentId,
    });
  }
  async getReviewsByCourse(courseId: string): Promise<ReviewsWithStats> {
    try {
      const reviews = await this.reviewRepository.findReviewsByCourse(courseId);
      const reviewStats = await this.reviewRepository.getCourseReviewStats(
        courseId
      );
      let updatedReviewStats;
      if (!reviewStats.length) {
        updatedReviewStats = {
          averageRating: 0,
          totalReviews: 0,
          ratingBreakdown: {
            "1star": 0,
            "2star": 0,
            "3star": 0,
            "4star": 0,
            "5star": 0,
          },
        };
      } else {
        const ratingBreakdown = reviewStats[0].ratings.reduce(
          (acc, { count, rating }) => {
            acc[`${rating}star`] = count;
            return acc;
          },
          {} as RatingBreakDown
        );
        updatedReviewStats = {
          averageRating: reviewStats[0].averageRating,
          totalReviews: reviewStats[0].totalReviews,
          ratingBreakdown: ratingBreakdown,
        };
      }
      const updatedData = reviews.map((review) => {
        return {
          id: review.id,
          studentId: {
            name: review.studentId.name,
            avatar: review.studentId.profilePicture,
          },
          rating: review.rating,
          comment: review.comment,
          createdAt: review.createdAt,
        };
      });
      const updatedReview = {
        reviews: updatedData,
        reviewStats: updatedReviewStats,
      };
      return updatedReview;
    } catch (error) {
      throw error;
    }
  }

  async getReviewsByStudent(studentId: string) {
    try {
      return this.reviewRepository.findReviewsByStudent(studentId);
    } catch (error) {
      throw error;
    }
  }

  async deleteReview(reviewId: string, studentId: string) {
    try {
      const review = await this.reviewRepository.findReviewById(reviewId);
      if (!review) throw new BadRequestError("Review not found");

      if (review.studentId.toString() !== studentId) {
        throw new AppError(
          "You can only delete your own reviews",
          StatusCode.FORBIDDEN
        );
      }

      await this.reviewRepository.delete(reviewId);
    } catch (error) {
      throw error;
    }
  }
}
