import { Orders } from "razorpay/dist/types/orders";

export interface IPaymentService {
    createRazorPayOrder(itemId:string, type:string):Promise<Orders.RazorpayOrder>;
  }
  