import mongoose from "mongoose";
import { ITransaction, Transaction } from "../models/transactionModel";
import { ITransactionRepository } from "./interfaces/ITransactionRepository";

export class TransactionRepository implements ITransactionRepository {
  async createTransaction(
    userId: string,
    amount: number,
    purchaseType: "course" | "service" | "coins",
    purchaseId: string,
    paymentId: string,
  ): Promise<ITransaction> {
    const transaction = new Transaction({
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
    return await Transaction.find({ userId }).sort({ createdAt: -1 });
  }
}
