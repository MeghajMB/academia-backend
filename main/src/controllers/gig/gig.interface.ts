import { Request, Response, NextFunction } from "express";

export interface IGigController {
  createGig(req: Request, res: Response, next: NextFunction): Promise<void>;
  getGigById(req: Request, res: Response, next: NextFunction): Promise<void>;
  getActiveGigs(req: Request, res: Response, next: NextFunction): Promise<void>;
  getActiveGigsOfInstructor(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void>;
  updateGig(req: Request, res: Response, next: NextFunction): Promise<void>;
  deleteGig(req: Request, res: Response, next: NextFunction): Promise<void>;
}
