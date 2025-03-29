import { NextFunction, Request, Response } from "express";
// services
import { PaymentService } from "../../services/implementations/payment.service";
//errors
import { AppError } from "../../util/errors/app-error";
import { BadRequestError } from "../../util/errors/bad-request-error";
import { StatusCode } from "../../enums/status-code.enum";

export class PaymentController {
  constructor(private paymentService: PaymentService) {}

  async createOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const { itemId, type } = req.body;
      if (!itemId || !type) {
        throw new BadRequestError("Invalid data");
      }
      const order = await this.paymentService.createRazorPayOrder(itemId, type);

      res.send({
        order_id: order.id,
        currency: order.currency,
        amount: order.amount,
      });
    } catch (error) {
      next(error);
    }
  }

  async paymentSuccess(req: Request, res: Response, next: NextFunction) {
    try {
      const { razorpayDetails, paymentDetails } = req.body as {
        razorpayDetails: {
          razorpay_order_id: string;
          razorpay_payment_id: string;
          razorpay_signature: string;
        };
        paymentDetails: {
          itemId: string;
          paymentType: string;
          amount: number;
        };
      };
      const userId=req.verifiedUser?.id!
      
      if (
        !razorpayDetails.razorpay_order_id ||
        !razorpayDetails.razorpay_payment_id ||
        !razorpayDetails.razorpay_signature ||
        !paymentDetails.amount ||
        !paymentDetails.itemId ||
        !paymentDetails.paymentType ||
        !userId
      ) {
        throw new BadRequestError("Missing payment details");
      }

      // Call the payment service to verify the payment and process the payment
      const result = await this.paymentService.handlePaymentSuccess(
        razorpayDetails.razorpay_order_id,
        razorpayDetails.razorpay_payment_id,
        razorpayDetails.razorpay_signature,
        {...paymentDetails,userId} // Pass the payment details including courseId, userId, etc.
      );

      res.status(200).send({
        message: "Payment successful",
        result,
      });
    } catch (error) {
      next(error);
    }
  }
}
