
import { IBidDocument } from "../../models/bid.model";
import { AppError } from "../../util/errors/app-error";
import { StatusCode } from "../../enums/status-code.enum";
import { redisPubSub } from "../../lib/redisPubSub";
import { redis } from "../../lib/redis";
import { BadRequestError } from "../../util/errors/bad-request-error";

import mongoose from "mongoose";
import { produceMessage } from "../../kafka/producer";
import { GigRepository } from "../../repositories/implementations/gig.repository";
import { UserRepository } from "../../repositories/implementations/user.repository";
import { BidRepository } from "../../repositories/implementations/bid.repository";


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
        throw new BadRequestError("Gig not found");
      }

      if (new Date(gig.biddingExpiresAt).getTime() < Date.now()) {
        throw new BadRequestError("Bidding time has ended");
      }
      await produceMessage({ data: bidData, id });
    } catch (error) {
      throw error;
    }
  }

  async createBid(bidData: { gigId: string; bidAmt: number }, id: string) {
    console.log("In bid creation");
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const highestBidKey = `topBid:${bidData.gigId}`;
      const user = await this.userRepository.findById(id);
      if (!user) throw Error("User not found");

      // **Check if user has enough gold coins**
      if (Number(user.goldCoin) < bidData.bidAmt!) {
        throw Error("Insufficient gold coins for bidding");
      }

      const dbHighestBid = await this.bidRepository.getHighestBid(
        bidData.gigId
      );

      if (dbHighestBid && bidData.bidAmt! <= dbHighestBid.amount) {
        throw Error("Bid must be higher than current bid");
      }

      // **Create new bid**
      const existingGig = await this.gigRepository.findById(bidData.gigId);
      if (!existingGig || existingGig.instructorId == user.id) {
        throw Error("You cant bid");
      }
      const newBid = await this.bidRepository.createOrUpdateBid(
        {
          gigId: bidData.gigId,
          amount: bidData.bidAmt,
          userId: id,
        },
        session
      );

      if (existingGig.currentBidder) {
        await this.userRepository.addGoldCoins(
          id,
          existingGig?.currentBid,
          session
        );
      }
      await this.userRepository.deductGoldCoins(
        user.id,
        bidData.bidAmt,
        session
      );
      const updatedGig =
        await this.gigRepository.updateCurrentBidderWithSession(
          bidData.gigId,
          id,
          bidData.bidAmt,
          session
        );

      await session.commitTransaction();
      session.endSession();

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
      console.log("Bidding Complete");
      return newBid;
    } catch (error) {
      throw error;
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
