import { NextFunction, Request, Response } from "express";
// services
import { PaymentService } from "../services/paymentService";
//errors
import { AppError } from "../errors/app-error";
import { BadRequestError } from "../errors/bad-request-error";
import { StatusCode } from "../enums/statusCode.enum";

export class PaymentController {
  constructor(private paymentService: PaymentService) {}

  async createOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const { amount, currency } = req.body;
      if (!amount || !currency) {
        throw new BadRequestError("Provide an amount and currency");
      }
      const order = await this.paymentService.createRazorPayOrder(
        amount,
        "INR"
      );
      console.log(order)
      res.send({
        order_id: order.id,
        currency: order.currency,
        amount: order.amount,
    })
    } catch (error) {
      next(error);
    }
  }
}
