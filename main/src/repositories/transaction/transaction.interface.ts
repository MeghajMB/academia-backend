import mongoose from "mongoose";
import { TransactionDocument } from "../../models/transaction.model";
import { IRepository } from "../base/base.interface";
import {
  AggregatedEarnings,
  getPaginatedTransactionsOfUserRepositoryParams,
  TransactionBase,
} from "./transaction.types";

export interface ITransactionRepository
  extends IRepository<TransactionDocument> {
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
    type:"credit"|"debit",
    session: mongoose.mongo.ClientSession
  ): Promise<TransactionDocument>;
  getPaginatedTransactionsOfUser(payload:getPaginatedTransactionsOfUserRepositoryParams): Promise<{transactions:TransactionBase[],totalCount:[{count:number}]}>;
}
