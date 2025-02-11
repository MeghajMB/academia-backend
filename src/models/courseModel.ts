// src/infrastructure/database/UserModel.ts
import mongoose, { Schema, Document, Model } from "mongoose";

export interface CourseDocument extends Document {
  userId: mongoose.Schema.Types.ObjectId;
  title: string;
  price: number;
  subtitle: string;
  description: string;
  category: mongoose.Schema.Types.ObjectId;
  isBlocked: boolean;
  status: "pending" | "accepted" | "rejected" | "notRequested";
  rejected: string;
  imageThumbnail: string;
  promotionalVideo: string;
  createdAt: Date;
  updatedAt: Date;
}

const CourseSchema: Schema<CourseDocument> = new Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
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
      ref:"Category",
      required: true,
    },
    isBlocked: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected", "notRequested"],
      default: "notRequested",
    },
    rejected: {
      type: String,
      default: null,
    },
    imageThumbnail: {
      type: String,
      required: true,
    },
    promotionalVideo: {
      type: String,
      required: true,
    }
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

export const CourseModel: Model<CourseDocument> = mongoose.model<CourseDocument>(
  "Course",
  CourseSchema
);
