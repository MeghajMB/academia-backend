import mongoose, { Document } from "mongoose";
export interface ICourse{
    name: string;
    description: string;
  }
export interface ICourseResult extends Document {
  userId: mongoose.Schema.Types.ObjectId;
  title: string;
  price: string;
  subtitle: string;
  description: string;
  category: number;
  isBlocked: boolean;
  status: "pending" | "accepted" | "rejected" | "notRequested";
  rejected: string;
  imageThumbnail: string;
  promotionalVideo: string;
  curriculumId: mongoose.Schema.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  }

export interface ICourseRepository {
  createCourse(course: ICourse,session:object): Promise<ICourseResult|null>;
  // Additional methods like getUser, updateUser, etc.
}
