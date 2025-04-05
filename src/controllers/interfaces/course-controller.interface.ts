// interfaces/controllers/ICourseController.ts

import { Request, Response, NextFunction } from "express";

export interface ICourseController {
  createCourse(req: Request, res: Response, next: NextFunction): Promise<void>;
  addSection(req: Request, res: Response, next: NextFunction): Promise<void>;
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
  addLecture(req: Request, res: Response, next: NextFunction): Promise<void>;
  addProcessedLecture(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void>;
  generateLectureUrl(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void>;
  getCoursesOfInstructor(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void>;
  deleteLecture(req: Request, res: Response, next: NextFunction): Promise<void>;
  deleteSection(req: Request, res: Response, next: NextFunction): Promise<void>;
  submitCourseForReview(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void>;
  markLectureAsCompleted(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void>;
  listCourse(req: Request, res: Response, next: NextFunction): Promise<void>;
  changeOrderOfLecture(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void>;
  editLecture(req: Request, res: Response, next: NextFunction): Promise<void>;
  editSection(req: Request, res: Response, next: NextFunction): Promise<void>;
}
