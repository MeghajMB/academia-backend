import { Request, Response, NextFunction } from "express";

export interface IInstructorController {
  getProfile(req: Request, res: Response, next: NextFunction): Promise<void>;
  getAnalyticsSummary(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void>;
  getAnalytics(req: Request, res: Response, next: NextFunction): Promise<void>;
}
