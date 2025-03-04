import { StatusCode } from "../enums/statusCode.enum";
import { AppError } from "../errors/app-error";
import { BadRequestError } from "../errors/bad-request-error";
import { ICourseRepository } from "../repositories/interfaces/ICourseRepository";
import { IEnrollmentRepository } from "../repositories/interfaces/IEnrollmentRepository";
import { ReviewRepository } from "../repositories/reviewRepository";

export class ReviewService {
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
      const newReview = await this.reviewRepository.update(existingReview.id, {
        rating: reviewData.rating,
        comment: reviewData.comment,
      });
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
    enrollment.reviewStatus = true;
    await enrollment.save();

    // Create review
    return this.reviewRepository.createReview({
      ...reviewData,
      studentId,
    });
  }
  async getReviewsByCourse(courseId: string) {
    try {
      const reviews = await this.reviewRepository.findReviewsByCourse(courseId);
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
      return updatedData;
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

  async getReviewStatiticsOfCourse(courseId: string) {
    try {
      const reviewStats = await this.reviewRepository.getCourseReviewStats(
        courseId
      );
      if (!reviewStats.length) {
        return {
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
      }

      const { totalReviews, averageRating, ratings } = reviewStats[0];

      // Initialize rating breakdown
      const ratingBreakdown: Record<string, number> = {
        "1star": 0,
        "2star": 0,
        "3star": 0,
        "4star": 0,
        "5star": 0,
      };

      // Map actual ratings from aggregation reviewStats
      for (const { rating, count } of ratings) {
        ratingBreakdown[`${rating}star`] = (count / totalReviews) * 100;
      }

      return {
        averageRating,
        totalReviews,
        ratingBreakdown,
      };
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

      await this.reviewRepository.deleteReview(reviewId);
    } catch (error) {
      throw error;
    }
  }
}
