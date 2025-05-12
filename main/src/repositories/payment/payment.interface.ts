import { IRepository } from "../base/base.interface";
import { PaymentDocument } from "../../models/payment.model";

export interface IPaymentRepository extends IRepository<PaymentDocument> {
  findByRazorpayOrderId(orderId: string): Promise<PaymentDocument | null>;
}
