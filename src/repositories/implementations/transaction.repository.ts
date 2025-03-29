import { ITransactionRepository } from "../interfaces/transaction-repository.interface";
import { ITransaction, TransactionModel } from "../../models/transaction.model";

export class TransactionRepository implements ITransactionRepository {
  async createTransaction(
    userId: string,
    amount: number,
    purchaseType: "course" | "service" | "coins",
    purchaseId: string,
    paymentId: string,
  ): Promise<ITransaction> {
    const transaction = new TransactionModel({
      userId,
      amount,
      purchaseType,
      purchaseId,
      status: "success",
      paymentId,
    });

    await transaction.save();
    return transaction;
  }

  // async updateTransaction(
  //   orderId: string,
  //   status: "success" | "failed",
  //   paymentId?: string
  // ) {
  //   return await Transaction.findOneAndUpdate(
  //     { orderId },
  //     { status, paymentId },
  //     { new: true }
  //   );
  // }

  async getUserTransactions(userId: string) {
    return await TransactionModel.find({ userId }).sort({ createdAt: -1 });
  }
}
