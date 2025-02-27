import { IUserRepository } from "./interfaces/IUserRepository";
import { UserModel } from "../models/userModel";

import { IUser, IUserResult } from "../types/user.interface";
import { DatabaseError } from "../errors/database-error";
import { StatusCode } from "../enums/statusCode.enum";

export class UserRepository implements IUserRepository {

  async createUser(user: IUser): Promise<IUserResult> {
    try {
      const createdUser = new UserModel(user);
      const savedUser = await createdUser.save();
      return savedUser;
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

  async awardPurpleCoins(userId: string, coins: number): Promise<IUserResult|null> {
    try {
      const user = await UserModel.findByIdAndUpdate(
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
  

  async findById(id: string): Promise<IUserResult | null> {
    try {
      const user = await UserModel.findById(id);
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

  async save(user: IUserResult): Promise<IUserResult> {
    try {
      return await user.save();
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

  async findByEmail(email: string): Promise<IUserResult | null> {
    try {
      const user = await UserModel.findOne({ email });
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
    filters: { [key: string]: any },
    skip: number,
    limit: number
  ): Promise<IUserResult[] | null> {
    try {
      const users = await UserModel.find(filters)
        .skip(skip)
        .limit(limit)
        .sort({ name: 1 });

      if (!users) return null;

      return users;
    } catch (error: unknown) {
      console.error(error)
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
    search:string
  ): Promise<IUserResult[] | null> {
    try {
      let query: any = { role };
      if (search) {
        query.name = { $regex: search, $options: "i" }; // Case-insensitive search
      }
      const user = await UserModel.find(query)
        .skip(skip)
        .limit(limit)
        .sort({ name: 1 });
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

  async countDocuments(key: string, value: any): Promise<number> {
    try {
      const count = await UserModel.countDocuments({ [key]: value });
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
