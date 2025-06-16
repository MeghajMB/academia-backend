import { ContainerModule, ContainerModuleLoadOptions } from "inversify";
import { Types } from "../types";
import { IPaymentController } from "../../controllers/payment/payment.interface";
import { PaymentController } from "../../controllers/payment/payment.controller";
import { IPaymentService } from "../../services/payment/interfaces/payment.interface";
import { PaymentService } from "../../services/payment/payment.service";
import { IPaymentRepository } from "../../repositories/payment/payment.interface";
import { PaymentRepository } from "../../repositories/payment/payment.repository";
import { IWalletRepository } from "../../repositories/wallet/wallet.interface";
import { WalletRepository } from "../../repositories/wallet/wallet.repository";
import { ITransactionRepository } from "../../repositories/transaction/transaction.interface";
import { TransactionRepository } from "../../repositories/transaction/transaction.repository";
import { Model } from "mongoose";
import { WalletDocument, WalletModel } from "../../models/wallet.model";
import { PaymentDocument, PaymentModel } from "../../models/payment.model";
import {
  TransactionDocument,
  TransactionModel,
} from "../../models/transaction.model";
import { IPaymentGateway } from "../../services/payment/interfaces/payment-gateway.interface";
import { RazorpayGateway } from "../../services/payment/gateways/razorpay.gateway";

export const paymentModule: ContainerModule = new ContainerModule(
  (options: ContainerModuleLoadOptions) => {
    options
      .bind<IPaymentController>(Types.PaymentController)
      .to(PaymentController)
      .inSingletonScope();

    options
      .bind<IPaymentService>(Types.PaymentService)
      .to(PaymentService)
      .inSingletonScope();

    options
      .bind<IPaymentRepository>(Types.PaymentRepository)
      .to(PaymentRepository)
      .inSingletonScope();

    options
      .bind<Model<PaymentDocument>>(Types.PaymentModel)
      .toConstantValue(PaymentModel);

    /* Wallet */

    options
      .bind<IWalletRepository>(Types.WalletRepository)
      .to(WalletRepository)
      .inSingletonScope();

    options
      .bind<Model<WalletDocument>>(Types.WalletModel)
      .toConstantValue(WalletModel);

    /* Transaction */

    options
      .bind<ITransactionRepository>(Types.TransactionRepository)
      .to(TransactionRepository)
      .inSingletonScope();

    options
      .bind<Model<TransactionDocument>>(Types.TransactionModel)
      .toConstantValue(TransactionModel);

    /* Gateway */

    options
      .bind<IPaymentGateway>(Types.RazorpayGateway)
      .to(RazorpayGateway)
      .inSingletonScope();
  }
);
