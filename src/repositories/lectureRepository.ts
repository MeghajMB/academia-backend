import { BulkWriteResult } from "mongodb";
import { StatusCode } from "../enums/statusCode.enum";
import { DatabaseError } from "../errors/database-error";
import { ILectureDocument, LectureModel } from "../models/lectureModel";
import {
  ILectureRepository,
  ILectureResult,
  ILectureResultPopulated,
} from "./interfaces/ILectureRepository";
import mongoose from "mongoose";
import { BaseRepository } from "./base/baseRepository";

export class LectureRepository
  extends BaseRepository<ILectureDocument>
  implements ILectureRepository
{
  constructor() {
    super(LectureModel);
  }

  async findByIdWithPopulatedData(
    lectureId: string
  ): Promise<ILectureResultPopulated | null> {
    try {
      const lecture = await LectureModel.findById(lectureId).populate(
        "courseId"
      );
      if (!lecture) {
        return null;
      }
      return lecture as unknown as ILectureResultPopulated;
    } catch (error: unknown) {
      throw new DatabaseError(
        "An unexpected database error occurred",
        StatusCode.INTERNAL_SERVER_ERROR
      );
    }
  }

  async updateOrderOfLectureInSameSection(
    sectionId: mongoose.ObjectId,
    lectureId: mongoose.ObjectId,
    draggedOrder: number,
    targetOrder: number
  ): Promise<ILectureResult | null> {
    try {
      if (draggedOrder > targetOrder) {
        await LectureModel.updateMany(
          {
            sectionId,
            order: { $gte: targetOrder, $lt: draggedOrder },
          },
          { $inc: { order: 1 } }
        );
      } else {
        await LectureModel.updateMany(
          {
            sectionId,
            order: { $gt: draggedOrder, $lte: targetOrder },
          },
          { $inc: { order: -1 } }
        );
      }

      const updatedLecture = await LectureModel.findByIdAndUpdate(lectureId, {
        order: targetOrder,
      });

      return updatedLecture;
    } catch (error: unknown) {
      throw new DatabaseError(
        "An unexpected database error occurred",
        StatusCode.INTERNAL_SERVER_ERROR
      );
    }
  }

  async updateOrderOfLectureInDifferentSection(
    lectureId: mongoose.ObjectId,
    draggedSectionId: mongoose.ObjectId,
    targetSectionId: mongoose.ObjectId,
    draggedLectureOrder: number,
    targetOrder: number
  ): Promise<ILectureResult | null> {
    try {
      await LectureModel.updateMany(
        { sectionId: draggedSectionId, order: { $gte: draggedLectureOrder } },
        { $inc: { order: -1 } }
      );

      await LectureModel.updateMany(
        { sectionId: targetSectionId, order: { $gte: targetOrder } },
        { $inc: { order: 1 } }
      );
      const lecture = await LectureModel.findByIdAndUpdate(
        lectureId,
        { sectionId: targetSectionId, order: targetOrder },
        { new: true }
      );
      return lecture;
    } catch (error: unknown) {
      throw new DatabaseError(
        "An unexpected database error occurred",
        StatusCode.INTERNAL_SERVER_ERROR
      );
    }
  }

  async getLecturesWithCourseId(courseId: string): Promise<ILectureResult[]> {
    try {
      const lectures = await LectureModel.find({ courseId: courseId }).sort({
        order: 1,
      });
      return lectures;
    } catch (error: unknown) {
      throw new DatabaseError(
        "An unexpected database error occurred",
        StatusCode.INTERNAL_SERVER_ERROR
      );
    }
  }

  async updateLectureWithProcessedKey(
    lectureId: string,
    key: string
  ): Promise<ILectureResult | null> {
    try {
      const updatedLecture = await LectureModel.findByIdAndUpdate(
        lectureId,
        { $set: { videoUrl: key, status: "processed" } },
        { new: true }
      );
      return updatedLecture;
    } catch (error: unknown) {
      console.log(error)
      throw new DatabaseError(
        "An unexpected database error occurred",
        StatusCode.INTERNAL_SERVER_ERROR
      );
    }
  }

  async countDocumentWithSectionId(sectionId: string): Promise<number> {
    try {
      const lectureCount = await LectureModel.countDocuments({
        sectionId: sectionId,
      });
      return lectureCount;
    } catch (error: unknown) {
      console.log(error)
      throw new DatabaseError(
        "An unexpected database error occurred",
        StatusCode.INTERNAL_SERVER_ERROR
      );
    }
  }

  async getTotalLecturesOfCourse(courseId: string): Promise<number> {
    try {
      const lectureCount = await LectureModel.countDocuments({
        courseId: courseId,
      });
      return lectureCount;
    } catch (error: unknown) {
      throw new DatabaseError(
        "An unexpected database error occurred",
        StatusCode.INTERNAL_SERVER_ERROR
      );
    }
  }

  async deleteLecturesByFilter(
    filters: Partial<Record<keyof ILectureDocument, any>>
  ): Promise<number> {
    try {
      const result = await LectureModel.deleteMany(filters);
      return result.deletedCount; // Returns the number of deleted lectures
    } catch (error: unknown) {
      throw new DatabaseError(
        "An unexpected database error occurred",
        StatusCode.INTERNAL_SERVER_ERROR
      );
    }
  }

  async scheduleDeletionDateForLectures(
    sectionId: string,
    scheduledDeletionDate: Date
  ): Promise<void> {
    try {
      await LectureModel.updateMany(
        { sectionId },
        { $set: { scheduledDeletionDate, status: "archived" } }
      );
    } catch (error) {
      throw new DatabaseError(
        "Failed to schedule deletion for lectures",
        StatusCode.INTERNAL_SERVER_ERROR
      );
    }
  }

  async editLecture(
    lectureId: string,
    lectureData: { title: string; videoUrl: string; duration: number }
  ): Promise<ILectureResult | null> {
    try {
      const lecture = await LectureModel.findByIdAndUpdate(
        lectureId,
        lectureData,
        { new: true }
      );
      return lecture;
    } catch (error: unknown) {
      throw new DatabaseError(
        "An unexpected database error occurred",
        StatusCode.INTERNAL_SERVER_ERROR
      );
    }
  }
}
