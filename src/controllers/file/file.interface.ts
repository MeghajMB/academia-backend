import { Request, Response, NextFunction } from "express";

export interface IFileController {
  generateGetSignedUrl(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void>;

  generatePutSignedUrl(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void>;
}
