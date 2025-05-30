import { Request, Response, NextFunction } from "express";

export interface IAdminController {
  getUsers(req: Request, res: Response, next: NextFunction): Promise<void>;
  getAdminCourses(req: Request, res: Response, next: NextFunction): Promise<void>;
  getInstructorVerificationRequests(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void>;
  rejectVerificationRequest(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void>;
  approveVerificationRequest(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void>;
  getCategories(req: Request, res: Response, next: NextFunction): Promise<void>;
  getCourseReviewRequests(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void>;
  rejectCourseReviewRequest(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void>;
  approveCourseReviewRequest(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void>;
  getAnalytics(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void>;
}
