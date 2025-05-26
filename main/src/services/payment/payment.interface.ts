import { Orders } from "razorpay/dist/types/orders";
import {
  GetTransactionHistoryParams,
  getWalletServiceResponse,
} from "./payment.types";
import { RazorpayPaymentCapturedWebhook } from "../../types/razorpay";

export interface IPaymentService {
  createRazorPayOrder(
    itemId: string,
    type: string,
    userId: string
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
