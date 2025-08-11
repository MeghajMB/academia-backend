import { inject, injectable } from "inversify";
import { IPaymentGateway } from "../interfaces/payment-gateway.interface";
import { Types } from "../../../container/types";
import { BadRequestError } from "../../../util/errors/bad-request-error";
import { ICoinRepository } from "../../../repositories/coin/coin.interface";
import { ICourseRepository } from "../../../repositories/course/course.interface";
import { IEnrollmentRepository } from "../../../repositories/enrollment/enrollment.interface";
import { IPaymentRepository } from "../../../repositories/payment/payment.interface";
import { razorpay } from "../../../lib/razorPay";
import mongoose from "mongoose";

@injectable()
export class RazorpayGateway implements IPaymentGateway {
  constructor(
    @inject(Types.CourseRepository)
    private readonly courseRepository: ICourseRepository,
    @inject(Types.EnrollmentRepository)
    private readonly enrollmentRepository: IEnrollmentRepository,
    @inject(Types.PaymentRepository)
    private readonly paymentRepository: IPaymentRepository,
    @inject(Types.CoinRepository)
    private readonly coinRepository: ICoinRepository
  ) {}

  async createOrder(itemId: string, type: string, userId: string) {
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
}
