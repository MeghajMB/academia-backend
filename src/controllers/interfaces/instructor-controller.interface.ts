import { Request, Response, NextFunction } from "express";

export interface IInstructorController {
  getProfile(req: Request, res: Response, next: NextFunction): Promise<void>;
}
