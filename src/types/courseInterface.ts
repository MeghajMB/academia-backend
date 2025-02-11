import mongoose, { Document } from "mongoose";

export interface ICourseResult extends Document {
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

export interface ICurriculumResult extends Document {
  userId: mongoose.Schema.Types.ObjectId;
  courseId:mongoose.Schema.Types.ObjectId;
  sections: {
    _id?:mongoose.Schema.Types.ObjectId
    title: string;
    lectures: {
      _id?:mongoose.Schema.Types.ObjectId;
      title: string;
      content: string;
    }[];
  }[];
  createdAt: Date;
  updatedAt: Date;
}
