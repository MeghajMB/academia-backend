import { Request, Response, NextFunction } from "express";

export interface ILectureController {
  addLecture(req: Request, res: Response, next: NextFunction): Promise<void>;
  generateLectureUrl(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void>;
  deleteLecture(req: Request, res: Response, next: NextFunction): Promise<void>;
  markLectureAsCompleted(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void>;
  changeOrderOfLecture(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void>;
  editLecture(req: Request, res: Response, next: NextFunction): Promise<void>;
}
