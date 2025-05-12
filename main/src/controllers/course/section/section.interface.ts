import { Request, Response, NextFunction } from "express";

export interface ISectionController {
  addSection(req: Request, res: Response, next: NextFunction): Promise<void>;
  deleteSection(req: Request, res: Response, next: NextFunction): Promise<void>;
  editSection(req: Request, res: Response, next: NextFunction): Promise<void>;
}
