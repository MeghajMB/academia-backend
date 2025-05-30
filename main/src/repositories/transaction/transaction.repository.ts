import { ITransactionRepository } from "./transaction.interface";
import {
  TransactionDocument,
  TransactionModel,
} from "../../models/transaction.model";
import { BaseRepository } from "../base/base.repository";
import { DatabaseError } from "../../util/errors/database-error";
import { StatusCode } from "../../enums/status-code.enum";
import {
  AggregatedEarnings,
  getPaginatedTransactionsOfUserRepositoryParams,
  TransactionAnalyticsResult,
  TransactionBase,
} from "./transaction.types";
import { ClientSession, PipelineStage, Types } from "mongoose";
import { injectable } from "inversify";

@injectable()
export class TransactionRepository
  extends BaseRepository<TransactionDocument>
  implements ITransactionRepository
{
  constructor() {
    super(TransactionModel);
  }

  async fetchAdminTransactionAnalytics(
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
  }> {
    try {
      let dateFormat: string;

      switch (dateGroup) {
        case "daily":
          dateFormat = "%Y-%m-%d";
          break;
        case "monthly":
          dateFormat = "%Y-%m";
          break;
        case "yearly":
          dateFormat = "%Y";
          break;
        default:
          dateFormat = "%Y-%m-%d";
      }

      const pipeline: PipelineStage[] = [
        {
          $match: {
            ...matchStage,
            status: "success",
          },
        },
        {
          $group: {
            _id: {
              $dateToString: {
                format: dateFormat,
                date: "$createdAt",
              },
            },
            totalRevenue: { $sum: "$amount" },
            platformShare: { $sum: "$platformShare" },
            instructorShare: { $sum: "$instructorShare" },
            count: { $sum: 1 },
          },
        },
        {
          $sort: {
            _id: 1,
          },
        },
      ];

      const transactionStats = await TransactionModel.aggregate(
        pipeline
      ).exec();

      const updatedTransactionStats = transactionStats.map((item) => ({
        date: item._id,
        totalRevenue: item.totalRevenue,
        platformShare: item.platformShare,
        instructorShare: item.instructorShare,
        count: item.count,
      }));

      const summaryResult = await TransactionModel.aggregate([
        {
          $match: { ...matchStage },
        },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: "$amount" },
            platformShare: { $sum: "$platformShare" },
            instructorShare: { $sum: "$instructorShare" },
            count: { $sum: 1 },
          },
        },
      ]);

      const summary = summaryResult[0] || {
        totalRevenue: 0,
        platformShare: 0,
        instructorShare: 0,
        count: 0,
      };

      return { metrics: updatedTransactionStats, summary };
    } catch (error) {
      console.error(error);
      throw new DatabaseError(
        "An unexpected database error occurred",
        StatusCode.INTERNAL_SERVER_ERROR
      );
    }
  }

  async getPaginatedTransactionsOfUser(
    payload: getPaginatedTransactionsOfUserRepositoryParams
  ): Promise<{
    transactions: TransactionBase[];
    totalCount: [{ count: number }];
  }> {
    try {
      const matchCriteria: Record<string, any> = {
        userId: payload.userId,
      };

      if (payload.purchaseType !== "all") {
        matchCriteria.purchaseType = payload.purchaseType;
      }

      if (payload.type !== "all") {
        matchCriteria.type = payload.type;
      }
      const transactions = await TransactionModel.aggregate([
        {
          $match: matchCriteria,
        },
        {
          $facet: {
            transactions: [{ $skip: payload.skip }, { $limit: payload.limit }],
            totalCount: [{ $count: "count" }],
          },
        },
      ]);
      if (!transactions[0].totalCount[0]?.count) {
        transactions[0].totalCount[0] = { count: 0 };
      }

      return transactions[0];
    } catch (error) {
      console.log(error);
      throw new DatabaseError(
        "An unexpected database error occurred",
        StatusCode.INTERNAL_SERVER_ERROR
      );
    }
  }
  async getCourseEarnings(
    userId: string,
    filter: "quarter" | "month" | "year",
    start: Date,
    end: Date
  ): Promise<AggregatedEarnings[] | []> {
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
          $addFields: {
            formattedDate:
              filter === "month"
                ? { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }
                : filter === "quarter"
                ? {
                    $dateToString: {
                      format: "%G-%V",
                      date: "$createdAt",
                    },
                  }
                : { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
          },
        },
        {
          $group: {
            _id: "$formattedDate",
            earnings: { $sum: "$amount" },
          },
        },
        {
          $project: {
            _id: 0,
            date: "$_id",
            earnings: 1,
          },
        },
        {
          $sort: {
            date: 1,
          },
        },
      ]);

      return result as AggregatedEarnings[];
    } catch (error) {
      console.log(error);
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
    paymentId: string,
    type: "credit" | "debit",
    session: ClientSession
  ): Promise<TransactionDocument> {
    try {
      const transaction = new TransactionModel({
        userId,
        amount,
        purchaseType,
        purchaseId,
        status: "success",
        paymentId,
        type,
      });

      await transaction.save();
      return transaction;
    } catch (error) {
      console.log(error);
      throw new DatabaseError(
        "An unexpected database error occurred",
        StatusCode.INTERNAL_SERVER_ERROR
      );
    }
  }
}
