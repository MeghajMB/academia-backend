import mongoose, { Document } from "mongoose";
import { ITransaction } from "../../models/transaction.model";

export interface ITransactionRepository {
  createTransaction(
    userId: string,
    amount: number,
    purchaseType: "course" | "service" | "coins",
    purchaseId: string,
    paymentId:string,
    session:mongoose.mongo.ClientSession
  ): Promise<ITransaction>;
  getUserTransactions(userId: string): Promise<any>;
  // Additional methods like getUser, updateUser, etc.
}
