import {
  IUserRepository,
  ICreateUserResult,
} from "./interfaces/userRepository";
import { IUser } from "../interface/userInterface";
import { UserModel } from "../models/userModel";

export class UserRepository implements IUserRepository {
  async createUser(user: IUser): Promise<ICreateUserResult> {
    const createdUser = new UserModel(user);
    const savedUser = await createdUser.save();
    return savedUser;
  }

  async findById(id: string): Promise<ICreateUserResult | null> {
    const user = await UserModel.findById(id);
    if (!user) return null;

    return user;
  }
  async findByEmail(email: string): Promise<ICreateUserResult|null> {
    const user = await UserModel.findOne({ email });
    if (!user) return null;

    return user;
  }
}
