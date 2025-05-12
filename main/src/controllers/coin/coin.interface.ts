import { Request, Response, NextFunction } from "express";

export interface ICoinController {
  getPackages(req: Request, res: Response, next: NextFunction): Promise<void>;
  updateCoinRatio(req: Request, res: Response, next: NextFunction): Promise<void>;
}
