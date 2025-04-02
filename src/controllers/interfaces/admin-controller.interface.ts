import { Request, Response, NextFunction } from "express";

export interface IAdminController {
  getUsers(req: Request, res: Response, next: NextFunction): Promise<void>;
  getCourses(req: Request, res: Response, next: NextFunction): Promise<void>;
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
  blockUser(req: Request, res: Response, next: NextFunction): Promise<void>;
  blockCourse(req: Request, res: Response, next: NextFunction): Promise<void>;
  getCategories(req: Request, res: Response, next: NextFunction): Promise<void>;
  createCategory(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void>;
  editCategory(req: Request, res: Response, next: NextFunction): Promise<void>;
  blockCategory(req: Request, res: Response, next: NextFunction): Promise<void>;
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
}
