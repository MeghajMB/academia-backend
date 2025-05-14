import { Request, Response, NextFunction } from "express";

export interface IPaymentController {
  createOrder(req: Request, res: Response, next: NextFunction): Promise<void>;
  paymentSuccess(req: Request, res: Response, next: NextFunction): Promise<void>;
}
