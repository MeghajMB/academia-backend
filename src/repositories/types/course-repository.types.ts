import { Document, Types } from "mongoose";

import { IUserResult } from "./user-repository.types";
import { CategoryDocument } from "../../models/categoy.model";
import { UserDocument } from "../../models/user.model";

/* Core Course Type */
export interface Course {
  _id:Types.ObjectId;
  userId: Types.ObjectId;
  title: string;
  price: number;
  subtitle: string;
  description: string;
  category: Types.ObjectId;
  totalDuration: number;
  totalLectures: number;
  totalSections: number;
  isBlocked: boolean;
  status: "pending" | "accepted" | "rejected" | "draft" | "listed";
  rejectedReason: string;
  imageThumbnail: string;
  promotionalVideo: string;
  reviewStats?: CourseReviewStats;
  createdAt: Date;
  updatedAt: Date;
}

export interface CourseReviewStats {
  averageRating: number;
  totalReviews: number;
  ratingDistribution?: {
    fiveStars: number;
    fourStars: number;
    threeStars: number;
    twoStars: number;
    oneStar: number;
  };
}

/* Other types */

export interface CourseWithPopulatedFields extends Omit<Course,"category"|"userId"> {
  userId:UserDocument,
  category:CategoryDocument,
}

export interface ICourseResultWithUserId extends Document {
  userId: IUserResult;
  title: string;
  price: number;
  subtitle: string;
  description: string;
  category: CategoryDocument;
  totalDuration: number;
  totalLectures: number;
  totalSections: number;
  isBlocked: boolean;
  status: "pending" | "accepted" | "rejected" | "draft" | "listed";
  rejectedReason?: string;
  imageThumbnail: string;
  promotionalVideo: string;
  createdAt: Date;
  updatedAt: Date;
}
