import { razorpay } from "../../lib/razorPay";
import { BadRequestError } from "../../util/errors/bad-request-error";
import { IPaymentService } from "../interfaces/payment-service.interface";
import { ICourseRepository } from "../../repositories/interfaces/course-repository.interface";
import crypto from "crypto";
import { ICourseService } from "../interfaces/course-service.interface";
import mongoose from "mongoose";
import { TransactionRepository } from "../../repositories/implementations/transaction.repository";

export class PaymentService implements IPaymentService {
  constructor(
    private transactionRepository: TransactionRepository,
    private courseRepository: ICourseRepository,
    private courseService: ICourseService
  ) {}

  verifyPaymentSignature(paymentData: any, secret: string): boolean {
    const generatedSignature = crypto
      .createHmac("sha256", secret)
      .update(paymentData.order_id + "|" + paymentData.payment_id)
      .digest("hex");

    return generatedSignature === paymentData.signature;
  }

  async createRazorPayOrder(itemId: string, type: string) {
    try {
      let amount: number;
      switch (type) {
        case "course":
          const course = await this.courseRepository.findById(itemId);
          if (course?.status !== "listed") {
            throw new BadRequestError("The course is not listed");
          }
          amount = course.price;
          break;

        default:
          throw new BadRequestError("Provide adequate details");
      }

      let options = {
        amount: amount * 100,
        currency: "INR",
        receipt: `txn_${Date.now()}`,
        payment_capture: 1,
      };

      const response = await razorpay.orders.create(options);
      return response;
    } catch (err) {
      console.log(err);
      throw new BadRequestError("Not able to create order. Please try again!");
    }
  }

  async handlePaymentSuccess(
    razorpayOrderId: string,
    razorpayPaymentId: string,
    razorpaySignature: string,
    paymentDetails: {
      itemId: string;
      userId: string;
      paymentType: string;
      amount: number;
    } // Payment details (e.g., courseId, userId, paymentType)
  ) {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const secret = process.env.RAZORPAY_KEY_SECRET!;

      const paymentData = {
        order_id: razorpayOrderId,
        payment_id: razorpayPaymentId,
        signature: razorpaySignature,
      };

      // Verify the signature
      const isSignatureValid = this.verifyPaymentSignature(paymentData, secret);
      paymentDetails.amount = paymentDetails.amount / 100;

      if (!isSignatureValid) {
        throw new BadRequestError("Payment verification failed");
      }
      let enrollent, transaction;
      if (paymentDetails.paymentType == "course") {
        transaction = await this.transactionRepository.createTransaction(
          paymentDetails.userId,
          paymentDetails.amount,
          paymentDetails.paymentType,
          paymentDetails.itemId,
          razorpayPaymentId
        );

        enrollent = await this.courseService.enrollStudent(
          paymentDetails.itemId,
          paymentDetails.userId,
          transaction._id as string
        );
      } else {
        throw new BadRequestError("Payment verification failed");
      }
      await session.commitTransaction();

      return { message: "success" };
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }
}
