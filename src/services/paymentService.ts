//repositories
import { TransactionRepository } from "../repositories/transactionRepository";
//services

import { transporter } from "../util/emailClient";
import { redis } from "../config/redisClient";

//errors
import { RequestValidationError } from "../errors/request-validaion-error";
import { ExistingUserError } from "../errors/existing-user-error";
import { AppError } from "../errors/app-error";

//externl dependencies
import { StatusCode } from "../enums/statusCode.enum";
import { NotFoundError } from "../errors/not-found-error";
import { razorpay } from "../config/razorPay";
import { BadRequestError } from "../errors/bad-request-error";

export class PaymentService {
  constructor(private transactionRepository: TransactionRepository) {}

  async createRazorPayOrder(amount: number, currency: string) {
    const options = {
      amount: amount*100,
      currency: currency,
      receipt: `txn_${Date.now()}`,
      payment_capture: 1,
    };
    try {
      const response = await razorpay.orders.create(options);
      return response;
    } catch (err) {
      console.log(err);
      throw new BadRequestError("Not able to create order. Please try again!");
    }
  }
}
