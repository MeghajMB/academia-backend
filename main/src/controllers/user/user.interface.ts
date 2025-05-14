import { Request, Response, NextFunction } from "express";

export interface IUserController {
  getProfile(req: Request, res: Response, next: NextFunction): Promise<void>;
}
