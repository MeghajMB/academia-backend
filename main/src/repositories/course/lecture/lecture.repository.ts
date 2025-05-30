import mongoose, { Types } from "mongoose";
import { BaseRepository } from "../../base/base.repository";
import { ILectureRepository } from "./lecture.interface";
import { LectureDocument, LectureModel } from "../../../models/lecture.model";
import { DatabaseError } from "../../../util/errors/database-error";
import { StatusCode } from "../../../enums/status-code.enum";
import { LectureWithPopulatedData } from "./lecture.types";
import { injectable } from "inversify";

@injectable()
export class LectureRepository
  extends BaseRepository<LectureDocument>
  implements ILectureRepository
{
  constructor() {
    super(LectureModel);
  }

  async findByIdWithPopulatedData(
    lectureId: string
  ): Promise<LectureWithPopulatedData | null> {
    try {
      const lecture = await LectureModel.findById(lectureId).populate(
        "courseId"
      );
      return lecture as unknown as LectureWithPopulatedData | null;
    } catch (error: unknown) {
      throw new DatabaseError(
        "An unexpected database error occurred",
        StatusCode.INTERNAL_SERVER_ERROR
      );
    }
  }

  async updateOrderOfLectureInSameSection(
    sectionId: Types.ObjectId,
    lectureId: Types.ObjectId,
    draggedOrder: number,
    targetOrder: number
  ): Promise<LectureDocument | null> {
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
    lectureId: Types.ObjectId,
    draggedSectionId: Types.ObjectId,
    targetSectionId: Types.ObjectId,
    draggedLectureOrder: number,
    targetOrder: number
  ): Promise<LectureDocument | null> {
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

  async getLecturesWithCourseId(courseId: string): Promise<LectureDocument[]> {
    try {
      const lectures = await LectureModel.find({ courseId: courseId })
        .sort({
          order: 1,
        })
        .lean();
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
  ): Promise<LectureDocument | null> {
    try {
      const updatedLecture = await LectureModel.findByIdAndUpdate(
        lectureId,
        { $set: { videoUrl: key, status: "processed" } },
        { new: true }
      );
      return updatedLecture;
    } catch (error: unknown) {
      console.log(error);
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
      console.log(error);
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
    filters: Partial<Record<keyof LectureDocument, any>>
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
  ): Promise<LectureDocument | null> {
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
