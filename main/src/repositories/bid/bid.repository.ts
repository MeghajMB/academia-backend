import { ClientSession } from "mongoose";
import { BidModel, BidDocument } from "../../models/bid.model";
import { DatabaseError } from "../../util/errors/database-error";
import { StatusCode } from "../../enums/status-code.enum";
import { BaseRepository } from "../base/base.repository";
import { IBidRepository } from "./bid.interface";
import { injectable } from "inversify";

@injectable()
export class BidRepository
  extends BaseRepository<BidDocument>
  implements IBidRepository
{
  constructor() {
    super(BidModel);
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
      const existingBid = await BidModel.findOne({
        userId: bidData.userId,
        gigId: bidData.gigId,
      }).session(session);
      if (existingBid) {
        existingBid.amount = bidData.amount;
        return await existingBid.save({ session });
      }
      const bid = new BidModel(bidData);
      return await bid.save({ session });
    } catch (error) {
      throw new DatabaseError(
        "An unexpected database error occurred",
        StatusCode.INTERNAL_SERVER_ERROR
      );
    }
  }
  async getHighestBid(
    gigId: string
  ): Promise<{ gigId: string; amount: any; userId: any } | null> {
    try {
      const result = await BidModel.aggregate([
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
    const bids = await BidModel.find({ gigId }).sort({ amount: -1 }).lean();
    return bids;
  }
}
