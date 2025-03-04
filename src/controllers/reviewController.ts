import { Request, Response, NextFunction } from "express";
import { ReviewService } from "../services/reviewService";
import { StatusCode } from "../enums/statusCode.enum";
import { BadRequestError } from "../errors/bad-request-error";
import { NotFoundError } from "../errors/not-found-error";

export class ReviewController {
  constructor(private reviewService: ReviewService) {}

  async addReview(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.verifiedUser!;
      const { courseId, rating, comment } = req.body;

      if (!courseId || !rating || !comment) {
        throw new BadRequestError("All fields are required");
      }

      const review = await this.reviewService.addReview(
        { courseId, rating, comment },
        user.id
      );
      res.status(StatusCode.CREATED).json({ message: "Review added", review });
    } catch (error) {
      next(error);
    }
  }

  async getReviewsOfCourse(req: Request, res: Response, next: NextFunction) {
    try {
      const { courseId } = req.params;
      const reviews = await this.reviewService.getReviewsByCourse(courseId);
      res.status(StatusCode.OK).json(reviews);
    } catch (error) {
      next(error);
    }
  }

  async getReviewsByStudent(req: Request, res: Response, next: NextFunction) {
    try {
      const { studentId } = req.params;
      const reviews = await this.reviewService.getReviewsByStudent(studentId);
      if (!reviews.length) throw new NotFoundError("No reviews found");
      res.status(StatusCode.OK).json(reviews);
    } catch (error) {
      next(error);
    }
  }

  async getReviewStatiticsOfCourse(req: Request, res: Response, next: NextFunction) {
    try {
      const { courseId } = req.params;
      if(!courseId){
        throw new BadRequestError("Provide the courseId")
      }
      const reviews = await this.reviewService.getReviewStatiticsOfCourse(courseId);
      res.status(StatusCode.OK).send(reviews);
    } catch (error) {
      next(error);
    }
  }

  async deleteReview(req: Request, res: Response, next: NextFunction) {
    try {
      const { reviewId } = req.params;
      const user = req.verifiedUser!;
      await this.reviewService.deleteReview(reviewId, user.id);
      res
        .status(StatusCode.OK)
        .json({ message: "Review deleted successfully" });
    } catch (error) {
      next(error);
    }
  }
}
