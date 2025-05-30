import { Request, Response, NextFunction } from "express";

export interface ICoinController {
  getPackages(req: Request, res: Response, next: NextFunction): Promise<void>;
  getCoinConfig(req: Request, res: Response, next: NextFunction): Promise<void>;
  createCoinPackage(req: Request, res: Response, next: NextFunction): Promise<void>;
  updateCoinPackage(req: Request, res: Response, next: NextFunction): Promise<void>;
  deleteCoinPackage(req: Request, res: Response, next: NextFunction): Promise<void>;
  updateCoinRatio(req: Request, res: Response, next: NextFunction): Promise<void>;
}
