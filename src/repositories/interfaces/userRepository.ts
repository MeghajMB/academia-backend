import { Document } from "mongoose";
import { IUser } from "../../interface/userInterface";

// Interface for the user document
export interface ICreateUserResult extends Document {
  name: string;
  email: string;
  role: string;
  password: string;
  phoneNo?: number;
  isBlocked: boolean;
  profilePicture: string;
  googleId?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IUserRepository {
  createUser(user: IUser): Promise<ICreateUserResult>;
  findById(id: string): Promise<ICreateUserResult | null>;
  findByEmail(email: string): Promise<ICreateUserResult | null>;
  // Additional methods like getUser, updateUser, etc.
}
