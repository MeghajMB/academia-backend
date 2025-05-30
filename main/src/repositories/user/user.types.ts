import { Document, Types } from "mongoose";

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
  goldCoin: number;
  verified: string;
}

export interface IUserResult extends Document {
  _id: Types.ObjectId;
  name: string;
  email: string;
  role: string;
  password: string;
  phoneNo: number;
  isBlocked: boolean;
  purpleCoin: number;
  goldCoin: number;
  profilePicture: string;
  googleId: string;
  headline?: string;
  verified: string;
  rejectedReason?: string;
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

export interface UserSignData {
  name: string;
  email: string;
  password?: string;
  googleId?: string;
  profilePicture?:string;
}
