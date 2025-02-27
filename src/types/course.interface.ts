import mongoose, { Document } from "mongoose";
import { IUserResult } from "./user.interface";
import { ICategoryResult } from "../repositories/interfaces/ICategoryRepository";
import { IEnrollmentDocument } from "../models/enrollmentModel";

export interface ICourseResult extends Document {
  userId: mongoose.ObjectId;
  title: string;
  price: number;
  subtitle: string;
  description: string;
  category: mongoose.Schema.Types.ObjectId;
  totalDuration: number;
  totalLectures: number;
  totalSections: number;
  isBlocked: boolean;
  status: "pending" | "accepted" | "rejected" | "draft"|"listed";
  rejectedReason?: string;
  imageThumbnail: string;
  promotionalVideo: string;
}

export interface ICourseResultWithUserId extends Document {
  userId: IUserResult;
  title: string;
  price: number;
  subtitle: string;
  description: string;
  category:ICategoryResult;
  totalDuration: number;
  totalLectures: number;
  totalSections: number;
  isBlocked: boolean;
  status: "pending" | "accepted" | "rejected" | "draft"|"listed";
  rejectedReason?: string;
  imageThumbnail: string;
  promotionalVideo: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IEnrollmentWithCourse extends Omit<IEnrollmentDocument, "courseId"> {
  courseId: ICourseResult;
}
