import { Request, Response, NextFunction } from "express";
import { ReviewService } from "../../services/implementations/review.service";
import { StatusCode } from "../../enums/status-code.enum";
import {
  AddReviewRequestSchema,
  DeleteReviewRequestSchema,
  GetReviewsByStudentRequestSchema,
  GetReviewsOfCourseRequestSchema,
} from "../dtos/review/request.dto";
import {
  AddReviewResponseSchema,
  DeleteReviewResponseSchema,
  GetReviewsByStudentResponseSchema,
  GetReviewsOfCourseResponseSchema,
} from "../dtos/review/response.dto";
import { IReviewController } from "../interfaces/review-controller.interface";

export class ReviewController implements IReviewController {
  constructor(private reviewService: ReviewService) {}

  async addReview(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.verifiedUser!;
      const { courseId, rating, comment } = AddReviewRequestSchema.parse(
        req.body
      );
      const review = await this.reviewService.addReview(
        { courseId, rating, comment },
        user.id
      );
      const response = AddReviewResponseSchema.parse({
        status: "success",
        code: StatusCode.CREATED,
        message: "Review added",
        data: review,
      });
      res.status(response.code).json(response);
    } catch (error) {
      next(error);
    }
  }

  async getReviewsOfCourse(req: Request, res: Response, next: NextFunction) {
    try {
      const { courseId } = GetReviewsOfCourseRequestSchema.parse(req.params);
      const reviews = await this.reviewService.getReviewsByCourse(courseId);
      const response = GetReviewsOfCourseResponseSchema.parse({
        status: "success",
        code: StatusCode.OK,
        message: "Reviews retrieved successfully",
        data: reviews,
      });
      res.status(response.code).json(response);
    } catch (error) {
      next(error);
    }
  }

  async getReviewsByStudent(req: Request, res: Response, next: NextFunction) {
    try {
      const { studentId } = GetReviewsByStudentRequestSchema.parse(req.params);
      const reviews = await this.reviewService.getReviewsByStudent(studentId);
      const response = GetReviewsByStudentResponseSchema.parse({
        status: "success",
        code: StatusCode.OK,
        message: "Student reviews retrieved successfully",
        data: reviews,
      });
      res.status(response.code).json(response);
    } catch (error) {
      next(error);
    }
  }

  async deleteReview(req: Request, res: Response, next: NextFunction) {
    try {
      const { reviewId } = DeleteReviewRequestSchema.parse(req.params);
      const user = req.verifiedUser!;
      await this.reviewService.deleteReview(reviewId, user.id);
      const response = DeleteReviewResponseSchema.parse({
        status: "success",
        code: StatusCode.OK,
        message: "Review deleted successfully",
        data: null,
      });
      res.status(response.code).json(response);
    } catch (error) {
      next(error);
    }
  }
}
