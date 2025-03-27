import { ClientSession, Document } from "mongoose";
import { IUser, IUserResult } from "../../types/user.interface";

// Interface for the user document

export interface IUserRepository {
  createUser(user: IUser): Promise<IUserResult>;
  findById(id: string): Promise<IUserResult | null>;
  findByEmail(email: string): Promise<IUserResult | null>;
  fetchUsersWithPagination(
    skip: number,
    limit: number,
    role: string,
    search: string
  ): Promise<IUserResult[] | null>;
  fetchUsersWithFilters(
    filters: { [key: string]: any },
    skip: number,
    limit: number
  ): Promise<IUserResult[] | null>;
  countDocuments(key: string, value: any): Promise<number>;
  save(user: IUserResult): Promise<IUserResult>;
  awardPurpleCoins(userId: string, coins: number): Promise<IUserResult | null>;
  addGoldCoins(
    userId: string,
    coinsToAdd: number,
    session?: ClientSession
  ): Promise<IUserResult | null>;
  deductGoldCoins(
    userId: string,
    coinsToDeduct: number,
    session?: ClientSession
  ): Promise<IUserResult | null>;
  // Additional methods like getUser, updateUser, etc.
}
