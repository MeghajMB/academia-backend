import { NextFunction, Request, Response } from "express";
import { BadRequestError } from "../../util/errors/bad-request-error";
import crypto from "crypto";
import { IPaymentController } from "./payment.interface";
import { inject, injectable } from "inversify";
import { Types } from "../../container/types";
import { StatusCode } from "../../enums/status-code.enum";
import { IPaymentService } from "../../services/payment/payment.interface";
import {
  GetUserWalletResponseSchema,
  GetTransactionHistoryResponseSchema,
} from "@academia-dev/common";
import { GetTransactionHistoryRequestSchema } from "./request.dto";
import config from "../../config/configuration";
import { redis } from "../../lib/redis";
import {
  publishRazorPaySuccessPayment,
  runProducer,
} from "../../kafka/producers/producer";
import { RazorpayPaymentCapturedWebhook } from "../../types/razorpay";

@injectable()
export class PaymentController implements IPaymentController {
  private readonly pageLimit = 10;
  constructor(
    @inject(Types.PaymentService)
    private readonly paymentService: IPaymentService
  ) {}

  async getUserWallet(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const user = req.verifiedUser!;
      const review = await this.paymentService.getWallet(user.id);
      const response = GetUserWalletResponseSchema.parse({
        status: "success",
        code: StatusCode.OK,
        message: "Successfully fetched wallet",
        data: review,
      });
      res.status(response.code).json(response);
    } catch (error) {
      next(error);
    }
  }

  async getTransactionHistory(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.verifiedUser!;
      const data = GetTransactionHistoryRequestSchema.parse({
        ...req.query,
        userId: user.id,
        limit: this.pageLimit,
      });
      const review = await this.paymentService.getTransactionHistory(data);
      const response = GetTransactionHistoryResponseSchema.parse({
        status: "success",
        code: StatusCode.OK,
        message: "Successfully fetched transaction history",
        data: review,
      });
      res.status(response.code).json(response);
    } catch (error) {
      next(error);
    }
  }

  async createOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const { itemId, type } = req.body;
      const userId = req.verifiedUser!.id;
      if (!itemId || !type) {
        throw new BadRequestError("Invalid data");
      }
      const order = await this.paymentService.createRazorPayOrder(
        itemId,
        type,
        userId
      );

      res.send({
        order_id: order.id,
        currency: order.currency,
        amount: order.amount,
      });
    } catch (error) {
      next(error);
    }
  }
  /* Code when using razorpay webhooks */
  async verifyPayment(req: Request, res: Response, next: NextFunction) {
    try {
      const razorPayBody = req.body as RazorpayPaymentCapturedWebhook;
      const payload = JSON.stringify(razorPayBody);
      const signature = req.headers["x-razorpay-signature"];

      const generatedSignature = crypto
        .createHmac("sha256", process.env.RAZORPAY_WEB_HOOK_SECRET!)
        .update(payload)
        .digest("hex");

      if (generatedSignature !== signature) {
        throw new BadRequestError("Invalid Signature");
      }

      const processing = await redis.getex(
        `event:${razorPayBody.payload.payment.entity.order_id}`
      );

      if (processing) {
        res.status(StatusCode.OK).send({ status: "ok" });
        return;
      }
      await redis.setex(
        `event:${razorPayBody.payload.payment.entity.order_id}`,
        60 * 60,
        "processing"
      );
      publishRazorPaySuccessPayment({
        event: "payment-success",
        data: req.body,
      });

      res.status(StatusCode.OK).send({ status: "ok" });
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
      const userId = req.verifiedUser?.id!;

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
        { ...paymentDetails, userId } // Pass the payment details including courseId, userId, etc.
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
