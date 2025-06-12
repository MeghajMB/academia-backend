import { DatabaseError } from "../../util/errors/database-error";
import { StatusCode } from "../../enums/status-code.enum";
import { BaseRepository } from "../base/base.repository";
import { PaymentDocument } from "../../models/payment.model";
import { IPaymentRepository } from "./payment.interface";
import { inject, injectable } from "inversify";
import { Types } from "../../container/types";
import { Model } from "mongoose";

@injectable()
export class PaymentRepository
  extends BaseRepository<PaymentDocument>
  implements IPaymentRepository
{
  constructor(
    @inject(Types.PaymentModel)
    private readonly paymentModel: Model<PaymentDocument>
  ) {
    super(paymentModel);
  }
  async findByRazorpayOrderId(
    orderId: string
  ): Promise<PaymentDocument | null> {
    try {
      const orderDetails = await this.paymentModel.findOne({
        razorpayOrderId: orderId,
      });
      return orderDetails;
    } catch (error) {
      throw new DatabaseError(
        "An unexpected database error occurred",
        StatusCode.INTERNAL_SERVER_ERROR
      );
    }
  }
}
