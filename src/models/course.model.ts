// src/infrastructure/database/UserModel.ts
import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface CourseDocument extends Document {
  userId: Types.ObjectId;
  title: string;
  price: number;
  subtitle: string;
  description: string;
  category:Types.ObjectId;
  totalDuration: number;
  totalLectures: number;
  totalSections: number;
  isBlocked: boolean;
  status: "pending" | "accepted" | "rejected" | "draft" | "listed";
  rejectedReason: string;
  imageThumbnail: string;
  promotionalVideo: string;
  reviewStats?: {
    averageRating: number;
    totalReviews: number;
    ratingDistribution?: {
      fiveStars: number;
      fourStars: number;
      threeStars: number;
      twoStars: number;
      oneStar: number;
    };
  };
  createdAt: Date;
  updatedAt: Date;
}

const CourseSchema: Schema<CourseDocument> = new Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    subtitle: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    isBlocked: {
      type: Boolean,
      default: false,
    },
    totalDuration: { type: Number, default: 0 },
    totalLectures: { type: Number, default: 0 },
    totalSections: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected", "draft", "listed"],
      default: "draft",
    },
    rejectedReason: {
      type: String,
      default: "",
    },
    imageThumbnail: {
      type: String,
      required: true,
    },
    promotionalVideo: {
      type: String,
      required: true,
    },
    reviewStats: {
      averageRating: { type: Number, default: 0 },
      totalReviews: { type: Number, default: 0 },
      ratingDistribution: {
        fiveStars: { type: Number, default: 0 },
        fourStars: { type: Number, default: 0 },
        threeStars: { type: Number, default: 0 },
        twoStars: { type: Number, default: 0 },
        oneStar: { type: Number, default: 0 },
      },
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

export const CourseModel: Model<CourseDocument> =
  mongoose.model<CourseDocument>("Course", CourseSchema);
