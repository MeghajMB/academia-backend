import { StatusCode } from "../../enums/status-code.enum";
import { AppError } from "../../util/errors/app-error";
import { BadRequestError } from "../../util/errors/bad-request-error";
import { IEnrollmentRepository } from "../../repositories/enrollment/enrollment.interface";
import { IReviewService } from "./review.interface";
import { AddReviewResponse, ReviewsWithStats } from "./review.types";
import { ReviewWithPopulatedStudentId } from "../../repositories/review/review.types";
import { IReviewRepository } from "../../repositories/review/review.interface";
import { inject, injectable } from "inversify";
import { Types } from "../../container/types";

@injectable()
export class ReviewService implements IReviewService {
  constructor(
    @inject(Types.ReviewRepository)
    private readonly reviewRepository: IReviewRepository,
    @inject(Types.EnrollmentRepository)
    private readonly enrollmentRepository: IEnrollmentRepository,
  ) {}

  async addReview(
    reviewData: { courseId: string; rating: number; comment: string },
    studentId: string
  ): Promise<AddReviewResponse> {
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
      const updatedReview = {
        id: newReview._id.toString(),
        courseId: newReview.courseId.toString(),
        studentId: newReview.studentId.toString(),
        rating: newReview.rating,
        comment: newReview.comment,
        createdAt: newReview.createdAt.toISOString(),
      };
      return updatedReview;
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
    const newReview = await this.reviewRepository.create({
      ...reviewData,
      studentId,
    });
    const updatedReview = {
      id: newReview._id.toString(),
      courseId: newReview.courseId.toString(),
      studentId: newReview.studentId.toString(),
      rating: newReview.rating,
      comment: newReview.comment,
      createdAt: newReview.createdAt.toISOString(),
    };
    return updatedReview;
  }
  async getReviewsByCourse(
    courseId: string,
    userId?: string
  ): Promise<ReviewsWithStats> {
    try {
      const reviews = await this.reviewRepository.findReviewsByCourse(courseId);
      const reviewStats = await this.reviewRepository.getCourseReviewStats(
        courseId
      );
      let userReview: ReviewWithPopulatedStudentId | null = null;
      if (userId) {
        userReview = await this.reviewRepository.findByCourseAndStudent(
          courseId,
          userId
        );
      }

      let updatedReviewStats;
      const total = reviewStats[0]?.totalReviews;
      const initialRating = {
        "1star": 0,
        "2star": 0,
        "3star": 0,
        "4star": 0,
        "5star": 0,
      };
      if (!reviewStats.length) {
        updatedReviewStats = {
          averageRating: 0,
          totalReviews: 0,
          ratingBreakdown: initialRating,
        };
      } else {
        const ratingBreakdown = reviewStats[0].ratings.reduce(
          (acc, { count, rating }) => {
            const percent = total ? (count / total) * 100 : 0;
            acc[`${rating}star`] = parseFloat(percent.toFixed(2));
            return acc;
          },
          initialRating
        );
        updatedReviewStats = {
          averageRating: reviewStats[0].averageRating,
          totalReviews: reviewStats[0].totalReviews,
          ratingBreakdown: ratingBreakdown,
        };
      }
      const updatedData = reviews
        .filter((review) => review.studentId._id.toString() !== userId)
        .map((review) => {
          return {
            id: review._id.toString(),
            studentId: {
              id: review.studentId._id.toString(),
              name: review.studentId.name,
              avatar: review.studentId.profilePicture,
            },
            rating: review.rating,
            comment: review.comment,
            createdAt: review.createdAt.toISOString(),
          };
        });
      if (userReview) {
        updatedData.unshift({
          id: userReview._id.toString(),
          studentId: {
            id: userReview.studentId._id.toString(),
            name: userReview.studentId.name,
            avatar: userReview.studentId.profilePicture,
          },
          rating: userReview.rating,
          comment: userReview.comment,
          createdAt: userReview.createdAt.toISOString(),
        });
      }

      const updatedReview = {
        reviews: updatedData,
        reviewStats: updatedReviewStats,
      };
      return updatedReview;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async getReviewsByStudent(studentId: string) {
    try {
      const reviews = await this.reviewRepository.findReviewsByStudent(
        studentId
      );
      const updatedReviews = reviews.map((review) => {
        return {
          id: review._id.toString(),
          courseId: review.courseId._id.toString(),
          rating: review.rating,
          studentId: review.studentId.toString(),
          comment: review.comment,
          createdAt: review.createdAt.toISOString(),
        };
      });
      return updatedReviews;
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

  async editReview(
    reviewPayload: {
      courseId: string;
      rating: number;
      comment: string;
      reviewId: string;
    },
    studentId: string
  ) {
    try {
      const review = await this.reviewRepository.findReviewById(
        reviewPayload.reviewId
      );
      if (!review) throw new BadRequestError("Review not found");

      if (review.studentId.toString() !== studentId) {
        throw new AppError(
          "You can only delete your own reviews",
          StatusCode.FORBIDDEN
        );
      }

      await this.reviewRepository.update(
        reviewPayload.reviewId,
        { rating: reviewPayload.rating, comment: reviewPayload.comment },
        {}
      );
    } catch (error) {
      throw error;
    }
  }
}
