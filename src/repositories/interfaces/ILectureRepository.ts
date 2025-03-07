import mongoose, { Document } from "mongoose";
import { ICourseResult } from "../../types/course.interface";
import { IRepository } from "../base/IRepositoryInterface";
import { ILectureDocument } from "../../models/lectureModel";

export interface ILectureResult extends Document {
  sectionId: mongoose.ObjectId;
  courseId: mongoose.ObjectId | ICourseResult;
  title: string;
  videoUrl: string;
  duration: number;
  order: number;
  status: string;
  scheduledDeletionDate: Date;
}
export interface ILectureResultPopulated extends ILectureResult {
  courseId: ICourseResult; // Override courseId to be the populated Course document
}

export interface ILectureRepository extends IRepository<ILectureDocument> {
  getLecturesWithCourseId(courseId: string): Promise<ILectureResult[]>;
  deleteLecturesByFilter(
    filters: Partial<Record<keyof ILectureDocument, any>>
  ): Promise<number>;
  scheduleDeletionDateForLectures(
    sectionId: string,
    scheduledDeletionDate: Date
  ): Promise<void>;
  editLecture(
    lectureId: string,
    lectureData: { title: string; videoUrl: string; duration: number }
  ): Promise<ILectureResult | null>;
  updateOrderOfLectureInSameSection(
    sectionId: mongoose.ObjectId,
    lectureId: mongoose.ObjectId,
    draggedOrder: number,
    targetOrder: number
  ): Promise<ILectureResult | null>;
  updateOrderOfLectureInDifferentSection(
    lectureId: mongoose.ObjectId,
    draggedSectionId: mongoose.ObjectId,
    targetSectionId: mongoose.ObjectId,
    draggedLectureOrder: number,
    targetOrder: number
  ): Promise<ILectureResult | null>;
  updateLectureWithProcessedKey(
    lectureId: string,
    key: string
  ): Promise<ILectureResult | null>;
  countDocumentWithSectionId(sectionId: string): Promise<number>;
  getTotalLecturesOfCourse(courseId: string): Promise<number>;
  findByIdWithPopulatedData(
    lectureId: string
  ): Promise<ILectureResultPopulated | null>;
  // Additional methods like getUser, updateUser, etc.
}
