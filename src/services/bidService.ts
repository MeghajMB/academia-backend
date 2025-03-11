import { BidRepository } from "../repositories/bidRepository";
import { IBidDocument } from "../models/bidModel";
import { AppError } from "../errors/app-error";
import { StatusCode } from "../enums/statusCode.enum";
import { redisPubSub } from "../config/redisPubSub";
import { redis } from "../config/redisClient";
import { BadRequestError } from "../errors/bad-request-error";
import { UserRepository } from "../repositories/userRepository";
import { ObjectId, Types } from "mongoose";
import { produceMessage } from "../kafka/producer";
import { GigRepository } from "../repositories/gigRepository";

export class BidService {
  constructor(
    private bidRepository: BidRepository,
    private userRepository: UserRepository,
    private gigRepository: GigRepository
  ) {}

  async placeBid(bidData: { gigId: string; bidAmt: number }, id: string) {
    try {
      const highestBidKey = `topBid:${bidData.gigId}`;
      const cachedHighestBid = await redis.get(highestBidKey);
      if (cachedHighestBid) {
        const topBid = JSON.parse(cachedHighestBid);
        if (bidData.bidAmt! <= topBid.amount) {
          return { error: "Bid must be higher than current bid" };
        }
      }
      const gig = await this.gigRepository.findById(bidData.gigId);
      if (!gig) {
        throw new Error("Gig not found");
      }

      if (new Date(gig.biddingExpiresAt).getTime() < Date.now()) {
        return { success: false, message: "Bidding time has ended" };
      }
      await produceMessage({ data: bidData, id });
    } catch (error) {
      throw error;
    }
  }

  async createBid(bidData: { gigId: string; bidAmt: number }, id: string) {
    try {
      const highestBidKey = `topBid:${bidData.gigId}`;
      const user = await this.userRepository.findById(id);
      if (!user) throw new BadRequestError("User not found");

      // **Check if user has enough gold coins**
      if (Number(user.goldCoin) < bidData.bidAmt!) {
        throw new BadRequestError("Insufficient gold coins for bidding");
      }

      const dbHighestBid = await this.bidRepository.getHighestBid(
        bidData.gigId
      );

      if (dbHighestBid && bidData.bidAmt! <= dbHighestBid.amount) {
        return { error: "Bid must be higher than current bid" };
      }

      // **Deduct coins before placing the bid**
      //await this.userRepository.deductGoldCoins(user.id, bidData.amount!);
      // **Create new bid**
      const newBid = await this.bidRepository.createOrUpdateBid({
        gigId: bidData.gigId,
        amount: bidData.bidAmt,
        userId: id,
      });

      // **Update Redis cache**
      await redis.setex(
        highestBidKey,
        300,
        JSON.stringify({ userId: newBid.userId, amount: newBid.amount })
      );

      // **Publish event to Redis (for top 10 updates)**
      redisPubSub.pub.publish(
        `bids:${bidData.gigId}`,
        JSON.stringify({ gigId: bidData.gigId })
      );

      return newBid;
    } catch (error) {
      return error;
    }
  }

  async getBidById(id: string): Promise<IBidDocument | null> {
    const bid = await this.bidRepository.findBidById(id);
    if (!bid) {
      throw new AppError("Bid not found", StatusCode.NOT_FOUND);
    }
    return bid;
  }

  async getBidsForGig(gigId: string): Promise<IBidDocument[]> {
    return await this.bidRepository.findBidsByGigId(gigId);
  }

  async updateBid(
    id: string,
    updateData: Partial<IBidDocument>
  ): Promise<IBidDocument | null> {
    const updatedBid = await this.bidRepository.updateBid(id, updateData);
    if (!updatedBid) {
      throw new AppError("Bid not found", StatusCode.NOT_FOUND);
    }
    return updatedBid;
  }

  async deleteBid(id: string): Promise<void> {
    const bid = await this.bidRepository.deleteBid(id);
    if (!bid) {
      throw new AppError("Bid not found", StatusCode.NOT_FOUND);
    }
  }
}
