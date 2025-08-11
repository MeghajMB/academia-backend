import { container } from "../../../container";
import { Types } from "../../../container/types";
import { PaymentGatewayType } from "../../../enums/payment-gateway.enum";
import { IPaymentGateway } from "../interfaces/payment-gateway.interface";

export class PaymentGatewayFactory {
  static getGateway(gateway: PaymentGatewayType): IPaymentGateway {
    switch (gateway) {
      case PaymentGatewayType.Razorpay:
        return container.get<IPaymentGateway>(Types.RazorpayGateway);
      default:
        throw new Error("Unsupported payment gateway");
    }
  }
}
