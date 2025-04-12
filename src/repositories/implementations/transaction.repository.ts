import { ITransactionRepository } from "../interfaces/transaction-repository.interface";
import {
  TransactionDocument,
  TransactionModel,
} from "../../models/transaction.model";
import { BaseRepository } from "../base/base.repository";
import { DatabaseError } from "../../util/errors/database-error";
import { StatusCode } from "../../enums/status-code.enum";

export class TransactionRepository
  extends BaseRepository<TransactionDocument>
  implements ITransactionRepository
{
  constructor() {
    super(TransactionModel);
  }
  async getInstructorAnalytics(
    courseId: string,
    timeframe: "day" | "week" | "month" | "year"
  ) {
    try {
      const dateRange: { [key: string]: number } = {
        day: 1,
        week: 7,
        month: 30,
        year: 365,
      };

      // Calculate the start date based on the timeframe
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - dateRange[timeframe]);

      // Define the groupBy object based on timeframe
      const groupBy: { [key: string]: any } = {
        year: { $year: "$createdAt" },
      };
      if (
        timeframe === "month" ||
        timeframe === "week" ||
        timeframe === "day"
      ) {
        groupBy.month = { $month: "$createdAt" };
      }
      if (timeframe === "week") {
        groupBy.week = { $isoWeek: "$createdAt" };
      }
      if (timeframe === "day") {
        groupBy.day = { $dayOfMonth: "$createdAt" };
      }

      // Define the sort object dynamically
      const sortBy: { [key: string]: 1 } = { "_id.year": 1 };
      if (
        timeframe === "month" ||
        timeframe === "week" ||
        timeframe === "day"
      ) {
        sortBy["_id.month"] = 1;
      }
      if (timeframe === "week") {
        sortBy["_id.week"] = 1;
      }
      if (timeframe === "day") {
        sortBy["_id.day"] = 1;
      }

      const result = await TransactionModel.aggregate([
        // Match transactions for the course, status, and timeframe
        {
          $match: {
            status: "success",
            purchaseType: "course",
            purchaseId: courseId,
            createdAt: { $gte: startDate }, // Filter by timeframe
          },
        },
        // Group by the specified timeframe
        {
          $group: {
            _id: groupBy,
            totalAmount: { $sum: "$amount" },
            count: { $sum: 1 },
          },
        },
        // Sort by the grouped fields
        {
          $sort: sortBy,
        },
      ]);

      return result;
    } catch (error) {
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
