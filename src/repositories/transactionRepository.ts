import { Transaction } from "../models/transactionModel";
import { ITransactionRepository } from "./interfaces/ITransactionRepository";

export class TransactionRepository implements ITransactionRepository {
    
  async createTransaction(
    userId: string,
    amount: number,
    purchaseType: "course" | "service" | "coins",
    purchaseId: string
  ) {
    return await Transaction.create({
      userId,
      amount,
      purchaseType,
      purchaseId,
      status: "pending",
    });
  }

  async updateTransaction(
    orderId: string,
    status: "success" | "failed",
    paymentId?: string
  ) {
    return await Transaction.findOneAndUpdate(
      { orderId },
      { status, paymentId },
      { new: true }
    );
  }

  async getUserTransactions(userId: string) {
    return await Transaction.find({ userId }).sort({ createdAt: -1 });
  }
}
