import mongoose, { Document } from "mongoose";
import { IRepository } from "../base/IRepositoryInterface";
import { ISectionDocument } from "../../models/sectionModel";
import { ICourseResult } from "../../types/course.interface";

export interface ISectionResult extends Document {
  courseId:mongoose.ObjectId;
  title: string;
  order: number;
  description:string
}

export interface ISectionResultWithCourse extends Omit<ISectionResult, "courseId"> {
  courseId: ICourseResult; // 🔹 Replacing ObjectId with full course details
}


export interface ISectionRepository extends IRepository<ISectionDocument>  {
  getSectionsWithCourseId(courseId: string): Promise<ISectionResult[]>;
  countDocumentsByCourseId(courseId:string): Promise<number>;
  findByIdWithPopulatedData(sectionId: string): Promise<ISectionResultWithCourse | null>
  // Additional methods like getUser, updateUser, etc.
}
