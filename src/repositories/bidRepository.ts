import { BidModel, IBidDocument } from "../models/../models/bidModel";
import mongoose from "mongoose";

export class BidRepository {
  async createBid(bidData: Partial<IBidDocument>): Promise<IBidDocument> {
    const bid = new BidModel(bidData);
    return await bid.save();
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
