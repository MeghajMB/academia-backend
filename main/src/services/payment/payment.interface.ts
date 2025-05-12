import { Orders } from "razorpay/dist/types/orders";

export interface IPaymentService {
    createRazorPayOrder(itemId:string, type:string,userId:string):Promise<{
      id: string;
      amount: string |number;
      currency: string;
      paymentId: string;
  }>;
  }
  