import mongoose from "mongoose";
import { TransactionDocument } from "../../models/transaction.model";
import { IRepository } from "../base/base-repository.interface";

export interface ITransactionRepository extends IRepository<TransactionDocument> {
   getInstructorAnalytics(courseId: string,timeframe: "day" | "week" | "month" | "year"):Promise<any>
  createTransaction(
    userId: string,
    amount: number,
    purchaseType: "course" | "service" | "coins",
    purchaseId: string,
    paymentId:string,
    session:mongoose.mongo.ClientSession
  ): Promise<TransactionDocument>;
  getUserTransactions(userId: string): Promise<any>;
  // Additional methods like getUser, updateUser, etc.
}
