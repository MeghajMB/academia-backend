import { Types, ClientSession } from "mongoose";
import { WalletDocument, WalletModel } from "../../models/wallet.model";
import { BaseRepository } from "../base/base.repository";
import { IWalletRepository } from "./wallet.interface";
import { DatabaseError } from "../../util/errors/database-error";
import { StatusCode } from "../../enums/status-code.enum";
import { injectable } from "inversify";

@injectable()
export class WalletRepository
  extends BaseRepository<WalletDocument>
  implements IWalletRepository
{
  constructor() {
    super(WalletModel);
  }

    async addRedeemPoints(userId: string, pointsToAdd: number, session?: ClientSession): Promise<WalletDocument | null> {
      try {
        const updatedUser = await WalletModel.findByIdAndUpdate(
          userId,
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
    userId: Types.ObjectId,
    session: ClientSession
  ): Promise<WalletDocument> {
    try {
      const wallet = new WalletModel({ userId });
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
    userId: Types.ObjectId
  ): Promise<WalletDocument | null> {
    try {
      const wallet = await WalletModel.findOne({ userId });
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
    userId: Types.ObjectId,
    coinsToAdd: number,
    session?: ClientSession
  ): Promise<WalletDocument | null> {
    try {
      const updatedWallet = await WalletModel.findOneAndUpdate(
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
    userId: Types.ObjectId,
    coinsToDeduct: number,
    session?: ClientSession
  ): Promise<WalletDocument | null> {
    try {
      const updatedUser = await WalletModel.findOneAndUpdate(
        { userId },
        { $inc: { goldCoin: -coinsToDeduct } },
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

}
