import {
  GetTransactionHistoryParams,
  getWalletServiceResponse,
} from "../payment.types";
import { RazorpayPaymentCapturedWebhook } from "../../../types/razorpay";
import { PaymentGatewayType } from "../../../enums/payment-gateway.enum";

export interface IPaymentService {
  createOrder(
    itemId: string,
    type: string,
    userId: string,
    gateway: PaymentGatewayType
  ): Promise<{
    id: string;
    amount: string | number;
    currency: string;
    paymentId: string;
  }>;
  handlePaymentSuccess(
    razorpayOrderId: string,
    razorpayPaymentId: string,
    razorpaySignature: string,
    paymentDetails: {
      itemId: string;
      userId: string;
      paymentType: string;
      amount: number;
    }
  ): Promise<{ message: string }>;
  getWallet(userId: string): Promise<getWalletServiceResponse>;
  getTransactionHistory(payload: GetTransactionHistoryParams): Promise<any>;
  handlePaymentSuccessWithRazorpayWebhook(
    payload: RazorpayPaymentCapturedWebhook
  ): Promise<{ message: string }>;
}
