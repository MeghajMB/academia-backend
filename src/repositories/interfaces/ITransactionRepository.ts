import mongoose, { Document } from "mongoose";
import { ITransaction } from "../../models/transactionModel";

export interface ITransactionRepository {
  createTransaction(
    userId: string,
    amount: number,
    purchaseType: "course" | "service" | "coins",
    purchaseId: string,
    paymentId:string,
    session:{session:mongoose.mongo.ClientSession}
  ): Promise<ITransaction>;
  getUserTransactions(userId: string): Promise<any>;
  // Additional methods like getUser, updateUser, etc.
}
