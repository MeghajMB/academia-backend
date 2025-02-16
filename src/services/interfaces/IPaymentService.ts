import { Orders } from "razorpay/dist/types/orders";

export interface IPaymentService {
    createRazorPayOrder(amount: number, currency: string):Promise<Orders.RazorpayOrder>;
  }
  