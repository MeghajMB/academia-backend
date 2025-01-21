// src/infrastructure/database/UserModel.ts
import mongoose, { Schema, Document, Model } from "mongoose";

export interface UserDocument extends Document {
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
  verified:string;
  rejectedReason:string;
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

const UserSchema: Schema<UserDocument> = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    role: {
      type: String,
      required: true,
      enum: ["student", "instructor"],
      default: "student",
    },
    purpleCoin: { type: Number, default: 0, required: true },
    goldCoin: { type: Number, default: 0, required: true },
    password: { type: String },
    phoneNo: { type: Number },
    isBlocked: { type: Boolean, required: true, default: false },
    verified:{
      type: String,
      required: true,
      enum: ["pending", "rejected","notRequested","verified"],
      default: "notRequested",
    },
    rejectedReason:{
      type:String,
    },
    profilePicture: { type: String, default: "" },
    googleId: { type: String },
    headline: { type: String, default: "student", trim: true },
    biography: { type: String, default: "", trim: true },
    links: {
      facebook: { type: String, default: "", trim: true },
      linkedin: { type: String, default: "", trim: true },
      twitter: { type: String, default: "", trim: true },
      website: { type: String, default: "", trim: true },
    }, 
  },
  {
    timestamps: true,
    toJSON:{
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
      },
  },
}

);

export const UserModel: Model<UserDocument> = mongoose.model<UserDocument>(
  "User",
  UserSchema
);
