import { ITransactionRepository } from "../interfaces/transaction-repository.interface";
import {
  TransactionDocument,
  TransactionModel,
} from "../../models/transaction.model";

export class TransactionRepository implements ITransactionRepository {
  async createTransaction(
    userId: string,
    amount: number,
    purchaseType: "course" | "service" | "coins",
    purchaseId: string,
    paymentId: string
  ): Promise<TransactionDocument> {
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

  async getUserTransactions(userId: string) {
    return await TransactionModel.find({ userId }).sort({ createdAt: -1 });
  }
}
