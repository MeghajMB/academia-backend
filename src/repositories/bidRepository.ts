import { BidModel, IBidDocument } from "../models/../models/bidModel";
import mongoose, { ClientSession } from "mongoose";

export class BidRepository {
  async createOrUpdateBid(
    bidData: {
      gigId: string;
      amount: number;
      userId: string;
    },
    session: ClientSession
  ): Promise<IBidDocument> {
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
      throw error;
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
      throw new Error(`Error fetching highest bid for gig ${gigId}: ${error}`);
    }
  }

  async findBidById(id: string): Promise<IBidDocument | null> {
    return await BidModel.findById(id);
  }

  async findBidsByGigId(gigId: string): Promise<IBidDocument[]> {
    return await BidModel.find({ gigId }).sort({ amount: -1 });
  }

  async updateBid(
    id: string,
    updateData: Partial<IBidDocument>
  ): Promise<IBidDocument | null> {
    return await BidModel.findByIdAndUpdate(id, updateData, { new: true });
  }

  async deleteBid(id: string): Promise<IBidDocument | null> {
    return await BidModel.findByIdAndDelete(id);
  }
}
