import { BidRepository } from "../repositories/bidRepository";
import { IBidDocument } from "../models/bidModel";
import { AppError } from "../errors/app-error";
import { StatusCode } from "../enums/statusCode.enum";
import { redisPubSub } from "../config/redisPubSub";
import { redis } from "../config/redisClient";
import { BadRequestError } from "../errors/bad-request-error";
import { UserRepository } from "../repositories/userRepository";
import { ObjectId, Types } from "mongoose";

export class BidService {
  constructor(
    private bidRepository: BidRepository,
    private userRepository: UserRepository
  ) {}

  async placeBid(bidData: { gigId: string; bidAmt: number }, id: string) {
    try {
      const highestBidKey = `topBid:${bidData.gigId}`;
      /* const user = await this.userRepository.findById(
        bidData.userId as unknown as string
      );
      if (!user) throw new BadRequestError("User not found");

      // **Check if user has enough gold coins**
      if (user.goldCoin < bidData.amount!) {
        throw new BadRequestError("Insufficient gold coins for bidding");
      } */

      // **Fetch highest bid from Redis**
      const cachedHighestBid = await redis.get(highestBidKey);
      console.log(cachedHighestBid)
      if (cachedHighestBid) {
        const topBid = JSON.parse(cachedHighestBid);
        if (bidData.bidAmt! <= topBid.amount) {
          return { error: "Bid must be higher than current bid" };
        }
      } else {
        // **If cache is empty, check the database**
        const dbHighestBid = await this.bidRepository.getHighestBid(
          bidData.gigId
        );
        if (dbHighestBid && bidData.bidAmt! <= dbHighestBid.amount) {
          return { error: "Bid must be higher than current bid" };
        }

        // **Cache the highest bid**
        if (dbHighestBid) {
          await redis.setex(
            highestBidKey,
            300,
            JSON.stringify({
              userId: dbHighestBid.userId,
              amount: dbHighestBid.amount,
            })
          );
        }
      }

      // **Deduct coins before placing the bid**
      //await this.userRepository.deductGoldCoins(user.id, bidData.amount!);
      // **Create new bid**
      const newBid = await this.bidRepository.createBid({
        gigId: bidData.gigId as unknown as Types.ObjectId,
        amount: bidData.bidAmt,
        userId: id as unknown as Types.ObjectId,
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
      return error
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
