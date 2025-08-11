import mongoose, { ClientSession, Model } from "mongoose";
import { WalletDocument } from "../../models/wallet.model";
import { BaseRepository } from "../base/base.repository";
import { IWalletRepository } from "./wallet.interface";
import { DatabaseError } from "../../util/errors/database-error";
import { StatusCode } from "../../enums/status-code.enum";
import { inject, injectable } from "inversify";
import { Types } from "../../container/types";

@injectable()
export class WalletRepository
  extends BaseRepository<WalletDocument>
  implements IWalletRepository
{
  constructor(
    @inject(Types.WalletModel)
    private readonly walletModel: Model<WalletDocument>
  ) {
    super(walletModel);
  }

  async addRedeemPoints(
    userId: mongoose.Types.ObjectId,
    pointsToAdd: number,
    session?: ClientSession
  ): Promise<WalletDocument | null> {
    try {
      const updatedUser = await this.walletModel.findOneAndUpdate(
        { userId },
        { $inc: { redeemPoints: pointsToAdd } },
        { session, new: true }
      );
      return updatedUser;
    } catch (error: unknown) {
      console.error(error);
      throw new DatabaseError(
        "An unexpected database error occurred",
        StatusCode.INTERNAL_SERVER_ERROR
      );
    }
  }

  async createWallet(
    userId: mongoose.Types.ObjectId,
    session: ClientSession
  ): Promise<WalletDocument> {
    try {
      const wallet = new this.walletModel({ userId });
      await wallet.save({ session });
      return wallet;
    } catch (error: unknown) {
      console.error(error);
      throw new DatabaseError(
        "An unexpected database error occurred",
        StatusCode.INTERNAL_SERVER_ERROR
      );
    }
  }

  async findWalletWithUserId(
    userId: mongoose.Types.ObjectId
  ): Promise<WalletDocument | null> {
    try {
      const wallet = await this.walletModel.findOne({ userId });
      return wallet;
    } catch (error: unknown) {
      console.error(error);
      throw new DatabaseError(
        "An unexpected database error occurred",
        StatusCode.INTERNAL_SERVER_ERROR
      );
    }
  }

  async addGoldCoins(
    userId: mongoose.Types.ObjectId,
    coinsToAdd: number,
    session?: ClientSession
  ): Promise<WalletDocument | null> {
    try {
      const updatedWallet = await this.walletModel.findOneAndUpdate(
        { userId },
        { $inc: { goldCoins: coinsToAdd } },
        { session, new: true }
      );

      return updatedWallet;
    } catch (error: unknown) {
      console.error(error);
      throw new DatabaseError(
        "An unexpected database error occurred",
        StatusCode.INTERNAL_SERVER_ERROR
      );
    }
  }

  async deductGoldCoins(
    userId: mongoose.Types.ObjectId,
    coinsToDeduct: number,
    session?: ClientSession
  ): Promise<WalletDocument | null> {
    try {
      const wallet = await this.walletModel.findOneAndUpdate(
        { userId, goldCoins: { $gte: coinsToDeduct } },
        { $inc: { goldCoin: -coinsToDeduct } },
        { session, new: true }
      );
      if (!wallet) {
        throw new Error("Insufficient gold coins or wallet not found");
      }
      return wallet;
    } catch (error: unknown) {
      console.error(error);
      throw new DatabaseError(
        "An unexpected database error occurred",
        StatusCode.INTERNAL_SERVER_ERROR
      );
    }
  }
}
