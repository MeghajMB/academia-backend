import {
  IUserRepository,
} from "./interfaces/userRepository";
import { UserModel } from "../models/userModel";

import { IUser, IUserResult } from "../types/userInterface";


export class UserRepository implements IUserRepository {
  async createUser(user: IUser): Promise<IUserResult> {
    const createdUser = new UserModel(user);
    const savedUser = await createdUser.save();
    return savedUser;
  }
  async findById(id: string): Promise<IUserResult | null> {
    const user = await UserModel.findById(id);
    if (!user) return null;

    return user;
  }
  async save(user:IUserResult): Promise<IUserResult> {
   
    return await user.save();
  }
  async findByEmail(email: string): Promise<IUserResult | null> {
    const user = await UserModel.findOne({ email });
    if (!user) return null;

    return user;
  }
  async fetchUsersWithFilters(
    filters: { [key: string]: any },
    skip: number,
    limit: number,
  ): Promise<IUserResult[] | null> {
    const users = await UserModel.find(filters)
      .skip(skip)
      .limit(limit)
      .sort({ name: 1 });
    
    if (!users) return null;
  
    return users;
  }
  async fetchUsersWithPagination(
    skip: number,
    limit: number,
    role: string
  ): Promise<IUserResult[] | null> {
    const user = await UserModel.find({ role })
      .skip(skip)
      .limit(limit)
      .sort({ name: 1 });
    if (!user) return null;

    return user;
  }
  async countDocuments(key:string,value:any): Promise<number>{
    const count= await UserModel.countDocuments({[key]:value})
    return count
  }
}
