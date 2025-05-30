import { DatabaseError } from "../../util/errors/database-error";
import { StatusCode } from "../../enums/status-code.enum";
import { BaseRepository } from "../base/base.repository";
import { PaymentDocument, PaymentModel } from "../../models/payment.model";
import { IPaymentRepository } from "./payment.interface";
import { injectable } from "inversify";

@injectable()
export class PaymentRepository
  extends BaseRepository<PaymentDocument>
  implements IPaymentRepository
{
  constructor() {
    super(PaymentModel);
  }
  async findByRazorpayOrderId(
    orderId: string
  ): Promise<PaymentDocument | null> {
    try {
      const orderDetails = await PaymentModel.findOne({
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
