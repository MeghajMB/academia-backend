import mongoose, { Document } from "mongoose";

export interface ILectureResult extends Document {
  sectionId: mongoose.ObjectId;
  courseId: mongoose.ObjectId;
  title: string;
  videoUrl: string;
  duration: number;
  order: number;
  status: string;
}

export interface ILectureRepository {
  getLecturesWithCourseId(courseId: string): Promise<ILectureResult[]>;
  updateLectureWithProcessedKey(lectureId:string,key:string): Promise<ILectureResult|null>;
  countDocumentWithSectionId(sectionId:string):Promise<number>;
  create(lectureData:{title:string,videoUrl:string,duration:number,order:number}): Promise<ILectureResult>;
  findById(lectureId:string): Promise<ILectureResult|null>;
  // Additional methods like getUser, updateUser, etc.
}
