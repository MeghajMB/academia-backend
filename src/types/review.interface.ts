import mongoose, { Document } from "mongoose";
import { IUserResult } from "./user.interface";

export interface ReviewWithPopulatedStudentId extends Document{
      courseId: mongoose.Schema.Types.ObjectId|string; // The course being reviewed
      studentId: IUserResult; // The student who wrote the review
      rating: number; // Rating (1-5)
      comment: string; // Review text
      createdAt: Date;
      updatedAt: Date;
}