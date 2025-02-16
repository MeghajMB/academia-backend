import mongoose, { Document } from "mongoose";

export interface ISectionResult extends Document {
  courseId:mongoose.ObjectId;
  title: string;
  order: number;
}

export interface ISectionRepository {
  getSectionsWithCourseId(courseId: string): Promise<ISectionResult[]>;
  create(sectionData:{ title: string; description: string,courseId:string }):Promise<ISectionResult>
  findById(sectionId: string): Promise<ISectionResult | null> 
  countDocumentsByCourseId(courseId:string): Promise<number>;
  // Additional methods like getUser, updateUser, etc.
}
