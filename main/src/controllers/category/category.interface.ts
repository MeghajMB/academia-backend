import { Request, Response, NextFunction } from "express";

export interface ICategoryController {
  getAllCategories(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void>;
  createCategory(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void>;
  editCategory(req: Request, res: Response, next: NextFunction): Promise<void>;
  blockCategory(req: Request, res: Response, next: NextFunction): Promise<void>;
}
