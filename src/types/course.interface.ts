import mongoose, { Document } from "mongoose";

export interface ICourseResult extends Document {
  userId: mongoose.Schema.Types.ObjectId;
  title: string;
  price: number;
  subtitle: string;
  description: string;
  category: mongoose.Schema.Types.ObjectId;
  isBlocked: boolean;
  status: "pending" | "accepted" | "rejected" | "draft";
  rejectReason?: string;
  imageThumbnail: string;
  promotionalVideo: string;
  createdAt: Date;
  updatedAt: Date;
}