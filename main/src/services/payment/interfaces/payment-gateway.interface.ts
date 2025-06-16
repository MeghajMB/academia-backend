export interface IPaymentGateway {
  createOrder(
    itemId: string,
    type: string,
    userId: string
  ): Promise<{
    id: string;
    amount: string | number;
    currency: string;
    paymentId: string;
  }>;
}
