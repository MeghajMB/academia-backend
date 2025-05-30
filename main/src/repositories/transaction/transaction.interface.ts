import mongoose from "mongoose";
import { TransactionDocument } from "../../models/transaction.model";
import { IRepository } from "../base/base.interface";
import {
  AggregatedEarnings,
  getPaginatedTransactionsOfUserRepositoryParams,
  TransactionAnalyticsResult,
  TransactionBase,
} from "./transaction.types";

export interface ITransactionRepository
  extends IRepository<TransactionDocument> {
  fetchAdminTransactionAnalytics(
    matchStage: Record<string, any>,
    dateGroup: "daily" | "monthly" | "yearly"
  ): Promise<{
    metrics: TransactionAnalyticsResult[];
    summary: {
      totalRevenue: number;
      platformShare: number;
      instructorShare: number;
      count: number;
    };
  }>;
  getCourseEarnings(
    userId: string,
    filter: "quarter" | "month" | "year",
    start: Date,
    end: Date
  ): Promise<AggregatedEarnings[] | []>;
  createTransaction(
    userId: string,
    amount: number,
    purchaseType: "course" | "service" | "coins",
    purchaseId: string,
    paymentId: string,
    type: "credit" | "debit",
    session: mongoose.mongo.ClientSession
  ): Promise<TransactionDocument>;
  getPaginatedTransactionsOfUser(
    payload: getPaginatedTransactionsOfUserRepositoryParams
  ): Promise<{
    transactions: TransactionBase[];
    totalCount: [{ count: number }];
  }>;
}
