import { ClientSession, Model } from "mongoose";
import { IUserRepository } from "./user.interface";
import { UserDocument } from "../../models/user.model";
import { DatabaseError } from "../../util/errors/database-error";
import { StatusCode } from "../../enums/status-code.enum";
import { BaseRepository } from "../base/base.repository";
import { UserSignData } from "./user.types";
import { inject, injectable } from "inversify";
import { Types } from "../../container/types";

@injectable()
export class UserRepository
  extends BaseRepository<UserDocument>
  implements IUserRepository
{
  constructor(
    @inject(Types.UserModel)
    private readonly userModel: Model<UserDocument>
  ) {
    super(userModel);
  }

  async createUserWithSession(
    userDetails: UserSignData,
    session: ClientSession
  ): Promise<UserDocument> {
    try {
      const user = new this.userModel(userDetails);
      await user.save({ session });
      return user;
    } catch (error: unknown) {
      console.error(error);
      throw new DatabaseError(
        "An unexpected database error occurred",
        StatusCode.INTERNAL_SERVER_ERROR
      );
    }
  }

  async awardPurpleCoins(
    userId: string,
    coins: number
  ): Promise<UserDocument | null> {
    try {
      const user = await this.userModel.findByIdAndUpdate(
        userId,
        { $inc: { purpleCoin: coins } }, // Increment purpleCoin by the given amount
        { new: true } // Return the updated user document
      );

      return user;
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.log(error.message);
      }
      throw new DatabaseError(
        "An unexpected database error occurred",
        StatusCode.INTERNAL_SERVER_ERROR
      );
    }
  }

  async findByEmail(email: string): Promise<UserDocument | null> {
    try {
      const user = await this.userModel.findOne({ email });
      if (!user) return null;

      return user;
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.log(error.message);
      }
      throw new DatabaseError(
        "An unexpected database error occurred",
        StatusCode.INTERNAL_SERVER_ERROR
      );
    }
  }

  async fetchUsersWithFilters(
    filters: Record<string, any>,
    skip: number,
    limit: number
  ): Promise<UserDocument[]> {
    try {
      const users = await this.userModel
        .find(filters)
        .skip(skip)
        .limit(limit)
        .sort({ name: 1 });

      return users;
    } catch (error: unknown) {
      console.error(error);
      throw new DatabaseError(
        "An unexpected database error occurred",
        StatusCode.INTERNAL_SERVER_ERROR
      );
    }
  }

  async fetchUsersWithPagination(
    skip: number,
    limit: number,
    role: string,
    search: string
  ): Promise<UserDocument[]> {
    try {
      const query: Record<string, any> = { role };
      if (search) {
        query.name = { $regex: search, $options: "i" };
      }
      const users = await this.userModel
        .find(query)
        .skip(skip)
        .limit(limit)
        .sort({ name: 1 })
        .lean();

      return users;
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.log(error.message);
      }
      throw new DatabaseError(
        "An unexpected database error occurred",
        StatusCode.INTERNAL_SERVER_ERROR
      );
    }
  }

  async countDocuments(key: string, value: string): Promise<number> {
    try {
      const count = await this.userModel.countDocuments({ [key]: value });
      return count;
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.log(error.message);
      }
      throw new DatabaseError(
        "An unexpected database error occurred",
        StatusCode.INTERNAL_SERVER_ERROR
      );
    }
  }
}
