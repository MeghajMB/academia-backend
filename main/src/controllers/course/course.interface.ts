// interfaces/controllers/ICourseController.ts

import { Request, Response, NextFunction } from "express";

export interface ICourseController {
  createCourse(req: Request, res: Response, next: NextFunction): Promise<void>;
  getEnrolledCoursesOfUser(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void>;
  getCurrriculum(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void>;
  getCourseDetails(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void>;
  getCourseCreationDetails(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void>;
  editCourseCreationDetails(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void>;
  getNewCourses(req: Request, res: Response, next: NextFunction): Promise<void>;
  getCoursesOfInstructor(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void>;
  submitCourseForReview(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void>;
  listCourse(req: Request, res: Response, next: NextFunction): Promise<void>;
  blockCourse(req: Request, res: Response, next: NextFunction): Promise<void>;
  getCourseAnalytics(req: Request, res: Response, next: NextFunction): Promise<void>;
  getCourses(req: Request, res: Response, next: NextFunction): Promise<void>;
}
