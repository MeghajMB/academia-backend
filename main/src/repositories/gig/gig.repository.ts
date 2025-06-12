import mongoose, { ClientSession, Model } from "mongoose";
import { BaseRepository } from "../base/base.repository";
import { GigDocument } from "../../models/gig.model";
import { IGigRepository } from "./gig.interface";
import { DatabaseError } from "../../util/errors/database-error";
import { StatusCode } from "../../enums/status-code.enum";
import {
  AggregatedGigEarnings,
  getGigMetricsRepositoryResponse,
  GigWithInstructorData,
} from "./gig.types";
import { inject, injectable } from "inversify";
import { Types } from "../../container/types";

@injectable()
export class GigRepository
  extends BaseRepository<GigDocument>
  implements IGigRepository
{
  constructor(
    @inject(Types.GigModel)
    private readonly gigModel: Model<GigDocument>
  ) {
    super(gigModel);
  }
  async getGigEarnings(
    userId: string,
    filter: "quarter" | "month" | "year",
    start: Date,
    end: Date
  ): Promise<AggregatedGigEarnings[] | []> {
    try {
      const result = await this.gigModel.aggregate([
        {
          $match: {
            instructorId: new mongoose.Types.ObjectId(userId),
            status: "completed",
            createdAt: { $gte: start, $lte: end },
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
                      format: "%G-%V", // ISO week format used for "quarter"-like grouping
                      date: "$createdAt",
                    },
                  }
                : { $dateToString: { format: "%Y-%m", date: "$createdAt" } }, // year filter
          },
        },
        {
          $group: {
            _id: "$formattedDate",
            earnings: { $sum: "$currentBid" },
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

      return result as AggregatedGigEarnings[];
    } catch (error: unknown) {
      console.log(error);
      throw new DatabaseError(
        "An unexpected database error occurred",
        StatusCode.INTERNAL_SERVER_ERROR
      );
    }
  }

  async getGigMetrics(
    userId: string
  ): Promise<getGigMetricsRepositoryResponse[] | []> {
    try {
      const gigMetrics = await this.gigModel.aggregate([
        {
          $match: {
            instructorId: new mongoose.Types.ObjectId(userId),
          },
        },
        {
          $group: {
            _id: "$instructorId",
            totalGigs: { $sum: 1 },
            activeGigs: {
              $sum: {
                $cond: [{ $eq: ["$status", "active"] }, 1, 0],
              },
            },
            expiredGigs: {
              $sum: {
                $cond: [{ $eq: ["$status", "expired"] }, 1, 0],
              },
            },
            completedGigs: {
              $sum: {
                $cond: [{ $eq: ["$status", "completed"] }, 1, 0],
              },
            },
            missedGigs: {
              $sum: {
                $cond: [{ $eq: ["$status", "missed"] }, 1, 0],
              },
            },
            noBidGigs: {
              $sum: {
                $cond: [{ $eq: ["$status", "no-bids"] }, 1, 0],
              },
            },
            totalGigEarnings: {
              $sum: {
                $cond: [{ $eq: ["$status", "completed"] }, "$currentBid", 0],
              },
            },
          },
        },
      ]);

      return gigMetrics;
    } catch (error: unknown) {
      console.log(error);
      throw new DatabaseError(
        "An unexpected database error occurred",
        StatusCode.INTERNAL_SERVER_ERROR
      );
    }
  }

  async getPaginatedGigs({
    limit,
    status,
    skip,
    search,
    sort,
    userId,
  }: {
    limit: number;
    status?: string;
    skip: number;
    search?: string;
    sort?: string;
    userId: string;
  }) {
    try {
      const query: Record<string, any> = { instructorId: userId };
      const sortQuery = {};
      if (search) {
        query.title = { $regex: search, $options: "i" };
      }
      if (status) {
        query.status = status;
      }
      if (sort) {
      }
      const gigs = await this.gigModel
        .find(query)
        .skip(skip)
        .limit(limit)
        .sort(sortQuery);
      return gigs;
    } catch (error: unknown) {
      console.log(error);
      throw new DatabaseError(
        "An unexpected database error occurred",
        StatusCode.INTERNAL_SERVER_ERROR
      );
    }
  }

  async updateCurrentBidderWithSession(
    gigId: string,
    bidderId: string,
    currentBid: number,
    session: ClientSession
  ): Promise<GigDocument | null> {
    try {
      const updatedGig = await this.gigModel.findByIdAndUpdate(
        gigId,
        {
          currentBidder: bidderId,
          currentBid: currentBid,
        },
        { new: true, session: session }
      );
      return updatedGig;
    } catch (error: unknown) {
      throw new DatabaseError(
        "An unexpected database error occurred",
        StatusCode.INTERNAL_SERVER_ERROR
      );
    }
  }

  async findConflictingGig(
    instructorId: string,
    sessionDate: Date,
    sessionDuration: number
  ): Promise<GigDocument | null> {
    try {
      const gigEndTime = new Date(
        sessionDate.getTime() + sessionDuration * 60000
      );

      const gig = await this.gigModel
        .findOne({
          instructorId: new mongoose.Types.ObjectId(instructorId),
          $or: [
            // New gig starts during an existing gig
            {
              sessionDate: { $gte: sessionDate, $lt: gigEndTime },
            },
            // New gig starts before an existing gig but overlaps
            {
              sessionDate: { $lte: sessionDate },
              $expr: {
                $gt: [
                  {
                    $add: [
                      "$sessionDate",
                      { $multiply: ["$sessionDuration", 60000] },
                    ],
                  },
                  sessionDate,
                ],
              },
            },
          ],
        })
        .lean();
      return gig;
    } catch (error: unknown) {
      throw new DatabaseError(
        "An error occurred while checking for conflicting gigs",
        StatusCode.INTERNAL_SERVER_ERROR
      );
    }
  }

  async getActiveGigsWithPopulatedData(): Promise<GigWithInstructorData[]> {
    try {
      const activeGigs = await this.gigModel
        .find({
          status: "active",
          biddingExpiresAt: { $gt: new Date() },
        })
        .populate("instructorId");
      return activeGigs as unknown as GigWithInstructorData[];
    } catch (error: unknown) {
      throw new DatabaseError(
        "An error occurred while checking for conflicting gigs",
        StatusCode.INTERNAL_SERVER_ERROR
      );
    }
  }
  async getActiveGigsOfInstructor(userId: string): Promise<GigDocument[]> {
    try {
      return await this.gigModel.find({
        instructorId: userId,
        status: "active",
      });
    } catch (error: unknown) {
      throw new DatabaseError(
        "An error occurred while checking for conflicting gigs",
        StatusCode.INTERNAL_SERVER_ERROR
      );
    }
  }
}
