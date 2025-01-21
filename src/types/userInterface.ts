import { Document } from "mongoose";

export interface IUser {
  name?: string;
  email?: string;
  password?: string;
  role?: string;
  phoneNo?: number;
  isBlocked?: boolean;
  profilePicture?: string;
  googleId?: string;
  id?: string;
}

export interface IUserResult extends Document {
  name: string;
  email: string;
  role: string;
  password: string;
  phoneNo: number;
  isBlocked: boolean;
  purpleCoin: Number;
  goldCoin: Number;
  profilePicture: string;
  googleId: string;
  headline?: string;
  verified: string;
  rejectedReason: string;
  biography?: string;
  links?: {
    facebook?: string;
    linkedin?: string;
    twitter?: string;
    website?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}
