import { Request, Response, NextFunction } from "express";

export interface IBidController {
  placeBid(req: Request, res: Response, next: NextFunction): Promise<void>;
  getBidById(req: Request, res: Response, next: NextFunction): Promise<void>;
  getBidsForGig(req: Request, res: Response, next: NextFunction): Promise<void>;
}
