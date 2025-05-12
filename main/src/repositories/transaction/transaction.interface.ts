import mongoose from "mongoose";
import { TransactionDocument } from "../../models/transaction.model";
import { IRepository } from "../base/base.interface";
import { AggregatedEarnings, getInstructorEarningsRepositoryResponse } from "./transaction.types";

export interface ITransactionRepository
  extends IRepository<TransactionDocument> {
  getCourseEarnings(
    userId: string,
    filter: "quarter" | "month" | "year",
    start: Date,
    end: Date
  ): Promise<AggregatedEarnings[]|[]>;
  createTransaction(
    userId: string,
    amount: number,
    purchaseType: "course" | "service" | "coins",
    purchaseId: string,
    paymentId: string,
    session: mongoose.mongo.ClientSession
  ): Promise<TransactionDocument>;
  getUserTransactions(userId: string): Promise<any>;
  // Additional methods like getUser, updateUser, etc.
}
