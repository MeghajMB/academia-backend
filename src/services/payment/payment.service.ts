import { razorpay } from "../../lib/razorPay";
import { BadRequestError } from "../../util/errors/bad-request-error";
import { IPaymentService } from "./payment.interface";
import { ICourseRepository } from "../../repositories/course/course.interface";
import crypto from "crypto";
import { ICourseService } from "../course/course.interface";
import mongoose, { Types } from "mongoose";
import { TransactionRepository } from "../../repositories/transaction/transaction.repository";
import { IEnrollmentRepository } from "../../repositories/enrollment/enrollment.interface";
import { IPaymentRepository } from "../../repositories/payment/payment.interface";

export class PaymentService implements IPaymentService {
  constructor(
    private transactionRepository: TransactionRepository,
    private courseRepository: ICourseRepository,
    private courseService: ICourseService,
    private enrollmentRepository: IEnrollmentRepository,
    private paymentRepository: IPaymentRepository
  ) {}

  verifyPaymentSignature(paymentData: any, secret: string): boolean {
    const generatedSignature = crypto
      .createHmac("sha256", secret)
      .update(paymentData.order_id + "|" + paymentData.payment_id)
      .digest("hex");

    return generatedSignature === paymentData.signature;
  }

  async createRazorPayOrder(
    itemId: string,
    type: string,
    userId: string
  ):Promise<{
    id: string;
    amount: string |number;
    currency: string;
    paymentId: string;
}> {
    try {
      let amount: number;
      switch (type) {
        case "course":
          const course = await this.courseRepository.findById(itemId);
          const enrollment = await this.enrollmentRepository.findOneByFilter({
            studentId: userId,
            courseId: itemId,
          });
          if (course?.status !== "listed") {
            throw new BadRequestError("The course is not listed");
          }
          if (enrollment) {
            throw new BadRequestError("You already own this course");
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

      const razorpayOrder = await razorpay.orders.create(options);

      const payment = await this.paymentRepository.create({
        razorpayOrderId: razorpayOrder.id,
        userId: new Types.ObjectId(userId),
        purchaseId: itemId,
        purchaseType:type,
        amount: options.amount,
        currency: options.currency,
        status: "created",
      });

      return {
        id: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        paymentId: payment._id.toString(),
      };
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
      //find existing payment
      const payment = await this.paymentRepository.findByRazorpayOrderId(razorpayOrderId);
      if (!payment) {
        throw new BadRequestError('Payment record not found');
      }
      if (payment.status === 'paid') {
        throw new BadRequestError('Payment already processed');
      }
      await this.paymentRepository.update(
        payment._id.toString(),
        {
          status: 'paid',
          razorpayPaymentId,
          razorpaySignature,
          updatedAt: new Date(),
        },
        {}
      );
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
          transaction._id.toString()
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
