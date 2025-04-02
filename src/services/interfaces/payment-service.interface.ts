import { Orders } from "razorpay/dist/types/orders";

export interface IPaymentService {
    createRazorPayOrder(itemId:string, type:string,userId:string):Promise<Orders.RazorpayOrder>;
  }
  