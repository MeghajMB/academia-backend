import { Request, Response, NextFunction } from "express";

export interface ICategoryController {
  getAllCategories(req: Request, res: Response, next: NextFunction): Promise<void>;
}
