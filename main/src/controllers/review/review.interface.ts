import { Request, Response, NextFunction } from "express";

export interface IReviewController {
  addReview(req: Request, res: Response, next: NextFunction): Promise<void>;
  getReviewsOfCourse(req: Request, res: Response, next: NextFunction): Promise<void>;
  getReviewsByStudent(req: Request, res: Response, next: NextFunction): Promise<void>;
  deleteReview(req: Request, res: Response, next: NextFunction): Promise<void>;
}
