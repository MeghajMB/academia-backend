import { ClientSession } from "mongoose";
import { UserDocument } from "../../models/user.model";
import { IRepository } from "../base/base.interface";
import { UserSignData } from "./user.types";

export interface IUserRepository extends IRepository<UserDocument> {
  createUserWithSession(
    userDetails: UserSignData,
    session: ClientSession
  ): Promise<UserDocument>;
  findByEmail(email: string): Promise<UserDocument | null>;
  fetchUsersWithPagination(
    skip: number,
    limit: number,
    role: string,
    search: string
  ): Promise<UserDocument[]>;
  fetchUsersWithFilters(
    filters: Record<string, any>,
    skip: number,
    limit: number
  ): Promise<UserDocument[]>;
  countDocuments(key: string, value: any): Promise<number>;
  awardPurpleCoins(userId: string, coins: number): Promise<UserDocument | null>;
}
