import { razorpay } from "../../lib/razorPay";
import { BadRequestError } from "../../util/errors/bad-request-error";
import { IPaymentService } from "./payment.interface";
import { ICourseRepository } from "../../repositories/course/course.interface";
import crypto from "crypto";
import { ICourseService } from "../course/course.interface";
import mongoose from "mongoose";
import { IEnrollmentRepository } from "../../repositories/enrollment/enrollment.interface";
import { IPaymentRepository } from "../../repositories/payment/payment.interface";
import config from "../../config/configuration";
import { inject, injectable } from "inversify";
import { Types } from "../../container/types";
import {
  GetTransactionHistoryParams,
  getWalletServiceResponse,
} from "./payment.types";
import { IWalletRepository } from "../../repositories/wallet/wallet.interface";
import { ICoinRepository } from "../../repositories/coin/coin.interface";
import { ITransactionRepository } from "../../repositories/transaction/transaction.interface";
import { RazorpayPaymentCapturedWebhook } from "../../types/razorpay";

@injectable()
export class PaymentService implements IPaymentService {
  constructor(
    @inject(Types.TransactionRepository)
    private readonly transactionRepository: ITransactionRepository,
    @inject(Types.CourseRepository)
    private readonly courseRepository: ICourseRepository,
    @inject(Types.CourseService)
    private readonly courseService: ICourseService,
    @inject(Types.EnrollmentRepository)
    private readonly enrollmentRepository: IEnrollmentRepository,
    @inject(Types.PaymentRepository)
    private readonly paymentRepository: IPaymentRepository,
    @inject(Types.WalletRepository)
    private readonly walletRepository: IWalletRepository,
    @inject(Types.CoinRepository)
    private readonly coinRepository: ICoinRepository
  ) {}

  async getTransactionHistory({
    limit,
    page,
    purchaseType,
    type,
    userId,
  }: GetTransactionHistoryParams): Promise<any> {
    try {
      const skip = (page - 1) * limit;

      const transactionsWithCount =
        await this.transactionRepository.getPaginatedTransactionsOfUser({
          skip,
          limit,
          purchaseType,
          type,
          userId: new mongoose.Types.ObjectId(userId),
        });
      const updatedTransactions = transactionsWithCount.transactions.map(
        (transaction) => {
          return {
            id: transaction._id.toString(),
            amount: transaction.amount,
            purchaseType: transaction.purchaseType,
            status: transaction.status,
            type: transaction.type,
            date: transaction.createdAt.toISOString(),
          };
        }
      );
      const totalDocuments = transactionsWithCount.totalCount[0].count;
      console.log(totalDocuments);
      const pagination = {
        totalDocuments: totalDocuments,
        totalPages: Math.ceil(totalDocuments / limit),
        currentPage: page,
        limit,
      };

      return { transactions: updatedTransactions, pagination };
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  private verifyPaymentSignature(paymentData: any, secret: string): boolean {
    const generatedSignature = crypto
      .createHmac("sha256", secret)
      .update(paymentData.order_id + "|" + paymentData.payment_id)
      .digest("hex");

    return generatedSignature === paymentData.signature;
  }

  async getWallet(userId: string): Promise<getWalletServiceResponse> {
    try {
      const wallet = await this.walletRepository.findWalletWithUserId(
        new mongoose.Types.ObjectId(userId)
      );
      if (!wallet) throw new BadRequestError("Something happened");
      const coinConfigData = await this.coinRepository.findAll();
      const updatedData = {
        walletId: wallet._id.toString(),
        totalEarnings: wallet.totalEarnings,
        goldCoins: wallet.goldCoins,
        redeemPoints: wallet.redeemPoints,
        goldConversion: coinConfigData[0].goldToINRRatio,
        redeemConversion: coinConfigData[0].redeemPointsToGoldRatio,
      };
      return updatedData;
    } catch (error) {
      throw error;
    }
  }

  async createRazorPayOrder(
    itemId: string,
    type: string,
    userId: string
  ): Promise<{
    id: string;
    amount: string | number;
    currency: string;
    paymentId: string;
  }> {
    try {
      let amount: number, coinAmt;
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
        case "coins":
          const coinConfig = await this.coinRepository.findAll();
          const coinPackage = coinConfig[0].purchasePackages.find(
            (coinPackage) => {
              return coinPackage._id.toString() === itemId;
            }
          );
          if (!coinPackage) {
            throw new BadRequestError("No package");
          }

          amount = coinPackage.priceInINR;
          coinAmt = coinPackage.coinAmount;
          break;
        default:
          throw new BadRequestError("Provide adequate details");
      }

      const options = {
        amount: amount * 100,
        currency: "INR",
        receipt: `txn_${Date.now()}`,
        payment_capture: 1,
      };

      const razorpayOrder = await razorpay.orders.create(options);

      const payment = await this.paymentRepository.create({
        razorpayOrderId: razorpayOrder.id,
        userId: new mongoose.Types.ObjectId(userId),
        purchaseId: itemId,
        purchaseType: type,
        amount: options.amount,
        currency: options.currency,
        status: "created",
        ...(coinAmt !== undefined ? { coinAmt } : {}),
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
      paymentType: "course" | "coins";
      amount: number;
    }
  ): Promise<{ message: string }> {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const secret = config.razorpay.keySecret;

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
      const payment = await this.paymentRepository.findByRazorpayOrderId(
        razorpayOrderId
      );
      if (!payment) {
        throw new BadRequestError("Payment record not found");
      }
      if (payment.status === "paid") {
        throw new BadRequestError("Payment already processed");
      }
      await this.paymentRepository.update(
        payment._id.toString(),
        {
          status: "paid",
          razorpayPaymentId,
          razorpaySignature,
          updatedAt: new Date(),
        },
        {}
      );
      const transaction = await this.transactionRepository.createTransaction(
        paymentDetails.userId,
        paymentDetails.amount,
        paymentDetails.paymentType,
        paymentDetails.itemId,
        razorpayPaymentId,
        "debit",
        session
      );
      if (paymentDetails.paymentType == "course") {
        await this.courseService.enrollStudent(
          paymentDetails.itemId,
          paymentDetails.userId,
          transaction._id.toString()
        );
      } else if (paymentDetails.paymentType == "coins") {
        const order = await this.paymentRepository.findByRazorpayOrderId(
          razorpayOrderId
        );
        await this.walletRepository.addGoldCoins(
          new mongoose.Types.ObjectId(paymentDetails.userId),
          order!.coinAmt,
          session
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
  async handlePaymentSuccessWithRazorpayWebhook(
    payload: RazorpayPaymentCapturedWebhook
  ): Promise<{ message: string }> {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      //handle the payment success details
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
