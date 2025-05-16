import { ContainerModule, ContainerModuleLoadOptions } from "inversify";
import { Types } from "../types";
import { IPaymentController } from "../../controllers/payment/payment.interface";
import { PaymentController } from "../../controllers/payment/payment.controller";
import { IPaymentService } from "../../services/payment/payment.interface";
import { PaymentService } from "../../services/payment/payment.service";
import { IPaymentRepository } from "../../repositories/payment/payment.interface";
import { PaymentRepository } from "../../repositories/payment/payment.repository";
import { IWalletRepository } from "../../repositories/wallet/wallet.interface";
import { WalletRepository } from "../../repositories/wallet/wallet.repository";
import { ITransactionRepository } from "../../repositories/transaction/transaction.interface";
import { TransactionRepository } from "../../repositories/transaction/transaction.repository";

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

    /* Wallet */

    options
      .bind<IWalletRepository>(Types.WalletRepository)
      .to(WalletRepository)
      .inSingletonScope();

    /* Transacction */

    options
      .bind<ITransactionRepository>(Types.TransactionRepository)
      .to(TransactionRepository)
      .inSingletonScope();
  }
);
