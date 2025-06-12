import mongoose, { ClientSession, Model } from "mongoose";
import { BidDocument } from "../../models/bid.model";
import { DatabaseError } from "../../util/errors/database-error";
import { StatusCode } from "../../enums/status-code.enum";
import { BaseRepository } from "../base/base.repository";
import { IBidRepository } from "./bid.interface";
import { inject, injectable } from "inversify";
import { Types } from "../../container/types";

@injectable()
export class BidRepository
  extends BaseRepository<BidDocument>
  implements IBidRepository
{
  constructor(
    @inject(Types.BidModel) private readonly bidModel: Model<BidDocument>
  ) {
    super(bidModel);
  }
  async createOrUpdateBid(
    bidData: {
      gigId: string;
      amount: number;
      userId: string;
    },
    session: ClientSession
  ): Promise<BidDocument> {
    try {
      const existingBid = await this.bidModel
        .findOne({
          userId: bidData.userId,
          gigId: bidData.gigId,
        })
        .session(session);
      if (existingBid) {
        existingBid.amount = bidData.amount;
        return await existingBid.save({ session });
      }
      const bid = new this.bidModel(bidData);
      return await bid.save({ session });
    } catch (error) {
      throw new DatabaseError(
        "An unexpected database error occurred",
        StatusCode.INTERNAL_SERVER_ERROR
      );
    }
  }
  async getHighestBid(gigId: string): Promise<{
    gigId: string;
    amount: number;
    userId: mongoose.Types.ObjectId;
  } | null> {
    try {
      const result = await this.bidModel.aggregate([
        { $match: { gigId } },
        {
          $group: {
            _id: "$gigId",
            highestBid: { $max: "$amount" },
            userId: { $first: "$userId" },
          },
        },
      ]);

      return result.length
        ? { gigId, amount: result[0].highestBid, userId: result[0].userId }
        : null;
    } catch (error) {
      throw new DatabaseError(
        "An unexpected database error occurred",
        StatusCode.INTERNAL_SERVER_ERROR
      );
    }
  }

  async findBidsByGigId(gigId: string): Promise<BidDocument[]> {
    const bids = await this.bidModel
      .find({ gigId })
      .sort({ amount: -1 })
      .lean();
    return bids;
  }
}
