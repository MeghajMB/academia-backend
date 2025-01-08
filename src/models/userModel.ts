// src/infrastructure/database/UserModel.ts
import mongoose, { Schema, Document, Model } from "mongoose";

export interface UserDocument extends Document {
  name: string;
  email: string;
  role: string;
  password: string;
  phoneNo: number;
  isBlocked: boolean;
  profilePicture: string;
  googleId: string;
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
    password: { type: String },
    phoneNo: { type: Number },
    isBlocked: { type: Boolean, required: true, default: false },
    profilePicture: { type: String,default:"#" },
    googleId: { type: String },
  },
  {
    timestamps: true,
  }
);

export const UserModel: Model<UserDocument> = mongoose.model<UserDocument>(
  "User",
  UserSchema
);
