import { StatusCode } from "../enums/statusCode.enum";
import { AppError } from "../errors/app-error";
import { BadRequestError } from "../errors/bad-request-error";
import { IEnrollmentRepository } from "../repositories/interfaces/IEnrollmentRepository";
import { ReviewRepository } from "../repositories/reviewRepository";

export class ReviewService {
  constructor(
    private reviewRepository: ReviewRepository,
    private enrollmentRepository: IEnrollmentRepository
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
      throw new BadRequestError("You have already reviewed this course");
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

    // if (enrollment.progress.percentage < 100) {
    //   throw new BadRequestError("You can only review a course after completing it");
    // }

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
      const reviews = this.reviewRepository.findReviewsByCourse(courseId);
      return reviews;
    } catch (error) {
      throw error;
    }
  }

  async getReviewsByStudent(studentId: string) {
    return this.reviewRepository.findReviewsByStudent(studentId);
  }

  async deleteReview(reviewId: string, studentId: string) {
    const review = await this.reviewRepository.findReviewById(reviewId);
    if (!review) throw new BadRequestError("Review not found");

    if (review.studentId.toString() !== studentId) {
      throw new AppError(
        "You can only delete your own reviews",
        StatusCode.FORBIDDEN
      );
    }

    await this.reviewRepository.deleteReview(reviewId);
  }
}
