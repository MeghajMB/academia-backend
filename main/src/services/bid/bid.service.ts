import { AppError } from "../../util/errors/app-error";
import { StatusCode } from "../../enums/status-code.enum";
import { redisPubSub } from "../../lib/redisPubSub";
import { redis } from "../../lib/redis";
import { BadRequestError } from "../../util/errors/bad-request-error";
import mongoose from "mongoose";
import { publishNewBids } from "../../kafka/producers/producer";
import { GigRepository } from "../../repositories/gig/gig.repository";
import { BidRepository } from "../../repositories/bid/bid.repository";
import { BidDocument } from "../../models/bid.model";
import { IBidService } from "./bid.interface";
import { IWalletRepository } from "../../repositories/wallet/wallet.interface";
import { inject, injectable } from "inversify";
import { Types } from "../../container/types";

@injectable()
export class BidService implements IBidService {
  constructor(
    @inject(Types.BidRepository) private readonly bidRepository: BidRepository,
    @inject(Types.GigRepository) private readonly gigRepository: GigRepository,
    @inject(Types.WalletRepository)
    private readonly walletRepository: IWalletRepository
  ) {}

  async placeBid(
    bidData: { gigId: string; bidAmt: number },
    userId: string
  ): Promise<{ message: "success" }> {
    try {
      const highestBidKey = `topBid:${bidData.gigId}`;
      const cachedHighestBid = await redis.get(highestBidKey);
      if (cachedHighestBid) {
        const topBid = JSON.parse(cachedHighestBid);
        if (bidData.bidAmt! <= topBid.amount) {
          throw new BadRequestError("Bid must be higher than current bid");
        }
      }
      const gig = await this.gigRepository.findById(bidData.gigId);
      if (!gig) {
        throw new BadRequestError("Gig not found");
      }
      if (new Date(gig.biddingExpiresAt).getTime() < Date.now()) {
        throw new BadRequestError("Bidding time has ended");
      }
      const wallet = await this.walletRepository.findWalletWithUserId(
        new mongoose.Types.ObjectId(userId)
      );
      if (!wallet) throw new BadRequestError("something happened");
      if (wallet.goldCoins < bidData.bidAmt) {
        throw new BadRequestError(
          `You only have ${wallet.goldCoins} coins.Purchse more to continue`
        );
      }
      await publishNewBids({ data: bidData, id: userId });
      return { message: "success" };
    } catch (error) {
      throw error;
    }
  }

  async createBid(bidData: { gigId: string; bidAmt: number }, userId: string) {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const highestBidKey = `topBid:${bidData.gigId}`;

      const dbHighestBid = await this.bidRepository.getHighestBid(
        bidData.gigId
      );

      if (dbHighestBid && bidData.bidAmt! <= dbHighestBid.amount) {
        throw Error("Bid must be higher than current bid");
      }

      // **Create new bid**
      const existingGig = await this.gigRepository.findById(bidData.gigId);
      if (!existingGig || existingGig.instructorId == new mongoose.Types.ObjectId(userId)) {
        throw Error("You cant bid");
      }
      const newBid = await this.bidRepository.createOrUpdateBid(
        {
          gigId: bidData.gigId,
          amount: bidData.bidAmt,
          userId: userId,
        },
        session
      );

      await this.walletRepository.deductGoldCoins(
        new mongoose.Types.ObjectId(userId),
        bidData.bidAmt,
        session
      );

      if (existingGig.currentBidder) {
        await this.walletRepository.addGoldCoins(
          existingGig.currentBidder,
          existingGig?.currentBid,
          session
        );
      }
      const updatedGig =
        await this.gigRepository.updateCurrentBidderWithSession(
          bidData.gigId,
          userId,
          bidData.bidAmt,
          session
        );

      await session.commitTransaction();

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
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  async getBidById(id: string): Promise<BidDocument> {
    try {
      const bid = await this.bidRepository.findById(id);
      if (!bid) {
        throw new AppError("Bid not found", StatusCode.NOT_FOUND);
      }
      return bid;
    } catch (error) {
      throw error;
    }
  }

  async getBidsForGig(gigId: string): Promise<BidDocument[]> {
    return await this.bidRepository.findBidsByGigId(gigId);
  }

  async updateBid(
    id: string,
    updateData: Partial<BidDocument>
  ): Promise<BidDocument | null> {
    const updatedBid = await this.bidRepository.update(id, updateData, {});
    if (!updatedBid) {
      throw new AppError("Bid not found", StatusCode.NOT_FOUND);
    }
    return updatedBid;
  }

  async deleteBid(id: string): Promise<void> {
    const bid = await this.bidRepository.delete(id);
    if (!bid) {
      throw new AppError("Bid not found", StatusCode.NOT_FOUND);
    }
  }
}
