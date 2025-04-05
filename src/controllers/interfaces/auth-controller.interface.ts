import { NextFunction, Request, Response } from "express";

export interface IAuthController {
  signUp(req: Request, res: Response, next: NextFunction): Promise<void>;
  verifyOtp(req: Request, res: Response, next: NextFunction): Promise<void>;
  resendOtp(req: Request, res: Response, next: NextFunction): Promise<void>;

  forgotPassword(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void>;
  verifyResetOtp(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void>;
  resetPassword(req: Request, res: Response, next: NextFunction): Promise<void>;

  refreshToken(req: Request, res: Response, next: NextFunction): Promise<void>;
  signIn(req: Request, res: Response, next: NextFunction): Promise<void>;
  signOut(req: Request, res: Response, next: NextFunction): Promise<void>;

  registerInstructor(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void>;
}
