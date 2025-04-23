import { ITransactionRepository } from "./transaction.interface";
import {
  TransactionDocument,
  TransactionModel,
} from "../../models/transaction.model";
import { BaseRepository } from "../base/base.repository";
import { DatabaseError } from "../../util/errors/database-error";
import { StatusCode } from "../../enums/status-code.enum";
import { AggregatedEarnings, getInstructorEarningsRepositoryResponse } from "./transaction.types";
import { Types } from "mongoose";

export class TransactionRepository
  extends BaseRepository<TransactionDocument>
  implements ITransactionRepository
{
  constructor() {
    super(TransactionModel);
  }
  async getCourseEarnings(
    userId: string,
    filter: "quarter" | "month" | "year",
    start: Date,
    end: Date
  ): Promise<AggregatedEarnings[]|[]> {
    try {
      const result = await TransactionModel.aggregate([
        {
          $match: {
            purchaseType: "course",
            status: "success",
            createdAt: { $gte: start, $lte: end },
          },
        },
        {
          $lookup: {
            from: "courses",
            localField: "purchaseId",
            foreignField: "_id",
            as: "course",
          },
        },
        { $unwind: "$course" },
        {
          $match: {
            "course.userId": new Types.ObjectId(userId),
          },
        },
        {
          $group: {
            _id: {
              year: { $year: "$createdAt" },
              ...(filter === "month" && { month: { $month: "$createdAt" } }),
              ...(filter === "quarter" && {
                quarter: { $ceil: { $divide: [{ $month: "$createdAt" }, 3] } },
              }),
            },
            total: { $sum: "$amount" },
          },
        },
      ]);
      return result
    } catch (error) {
      console.log(error)
      throw new DatabaseError(
        "An unexpected database error occurred",
        StatusCode.INTERNAL_SERVER_ERROR
      );
    }
  }
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
