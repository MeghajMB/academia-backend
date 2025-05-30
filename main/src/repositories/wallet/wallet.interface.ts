import { ClientSession, Types } from "mongoose";
import { WalletDocument } from "../../models/wallet.model";
import { IRepository } from "../base/base.interface";

export interface IWalletRepository extends IRepository<WalletDocument> {
  createWallet(
    userId: Types.ObjectId,
    session: ClientSession
  ): Promise<WalletDocument>;
  findWalletWithUserId(userId: Types.ObjectId): Promise<WalletDocument | null>;
  addGoldCoins(
    userId: Types.ObjectId,
    coinsToAdd: number,
    session?: ClientSession
  ): Promise<WalletDocument | null>;
  deductGoldCoins(
    userId: Types.ObjectId,
    coinsToDeduct: number,
    session?: ClientSession
  ): Promise<WalletDocument | null>;
    addRedeemPoints(
    userId: Types.ObjectId,
    pointsToAdd: number,
    session?: ClientSession
  ): Promise<WalletDocument | null>;
}
