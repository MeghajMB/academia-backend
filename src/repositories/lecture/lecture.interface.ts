import mongoose, { Types } from "mongoose";
import { IRepository } from "../base/base.interface";
import { LectureDocument } from "../../models/lecture.model";
import { LectureWithPopulatedData } from "./lecture.types";

export interface ILectureRepository extends IRepository<LectureDocument> {
  getLecturesWithCourseId(courseId: string): Promise<LectureDocument[]>;
  deleteLecturesByFilter(
    filters: Partial<Record<keyof LectureDocument, any>>
  ): Promise<number>;
  scheduleDeletionDateForLectures(
    sectionId: string,
    scheduledDeletionDate: Date
  ): Promise<void>;
  editLecture(
    lectureId: string,
    lectureData: { title: string; videoUrl: string; duration: number }
  ): Promise<LectureDocument | null>;
  updateOrderOfLectureInSameSection(
    sectionId: Types.ObjectId,
    lectureId: Types.ObjectId,
    draggedOrder: number,
    targetOrder: number
  ): Promise<LectureDocument | null>;
  updateOrderOfLectureInDifferentSection(
    lectureId: Types.ObjectId,
    draggedSectionId: Types.ObjectId,
    targetSectionId: Types.ObjectId,
    draggedLectureOrder: number,
    targetOrder: number
  ): Promise<LectureDocument | null>;
  updateLectureWithProcessedKey(
    lectureId: string,
    key: string
  ): Promise<LectureDocument | null>;
  countDocumentWithSectionId(sectionId: string): Promise<number>;
  getTotalLecturesOfCourse(courseId: string): Promise<number>;
  findByIdWithPopulatedData(
    lectureId: string
  ): Promise<LectureWithPopulatedData | null>;
  // Additional methods like getUser, updateUser, etc.
}
