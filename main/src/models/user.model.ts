// src/infrastructure/database/UserModel.ts
import mongoose, { Schema, Document, Model } from "mongoose";

export interface UserDocument extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  email: string;
  role: "student" | "instructor"|"admin";
  password: string;
  phoneNo: number;
  isBlocked: boolean;
  purpleCoin: number;
  profilePicture: string;
  googleId: string;
  headline?: string;
  verified: "pending" | "rejected" | "notRequested" | "verified";
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

const UserSchema: Schema<UserDocument> = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    role: {
      type: String,
      required: true,
      enum: ["student", "instructor","admin"],
      default: "student",
    },
    purpleCoin: { type: Number, default: 0, required: true },
    password: { type: String },
    phoneNo: { type: Number },
    isBlocked: { type: Boolean, required: true, default: false },
    verified: {
      type: String,
      required: true,
      enum: ["pending", "rejected", "notRequested", "verified"],
      default: "notRequested",
    },
    profilePicture: { type: String, default: "" },
    googleId: { type: String },
    headline: { type: String, default: "student", trim: true },
    biography: { type: String, trim: true },
    links: {
      facebook: { type: String, trim: true },
      linkedin: { type: String, trim: true },
      twitter: { type: String, trim: true },
      website: { type: String, trim: true },
    },
  },
  {
    timestamps: true,
    toJSON: {
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
