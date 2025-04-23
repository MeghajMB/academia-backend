import { ClientSession } from "mongoose";
import { UserDocument } from "../../models/user.model";
import { IRepository } from "../base/base.interface";

// Interface for the user document

export interface IUserRepository extends IRepository<UserDocument> {
  findByEmail(email: string): Promise<UserDocument | null>;
  fetchUsersWithPagination(
    skip: number,
    limit: number,
    role: string,
    search: string
  ): Promise<UserDocument[] | null>;
  fetchUsersWithFilters(
    filters: { [key: string]: any },
    skip: number,
    limit: number
  ): Promise<UserDocument[] | null>;
  countDocuments(key: string, value: any): Promise<number>;
  awardPurpleCoins(userId: string, coins: number): Promise<UserDocument | null>;
  addGoldCoins(
    userId: string,
    coinsToAdd: number,
    session?: ClientSession
  ): Promise<UserDocument | null>;
  deductGoldCoins(
    userId: string,
    coinsToDeduct: number,
    session?: ClientSession
  ): Promise<UserDocument | null>;
  // Additional methods like getUser, updateUser, etc.
}
