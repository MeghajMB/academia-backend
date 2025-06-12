import mongoose, { Model } from "mongoose";
import { BaseRepository } from "../../base/base.repository";
import { ILectureRepository } from "./lecture.interface";
import { LectureDocument } from "../../../models/lecture.model";
import { DatabaseError } from "../../../util/errors/database-error";
import { StatusCode } from "../../../enums/status-code.enum";
import { LectureWithPopulatedData } from "./lecture.types";
import { inject, injectable } from "inversify";
import { Types } from "../../../container/types";

@injectable()
export class LectureRepository
  extends BaseRepository<LectureDocument>
  implements ILectureRepository
{
  constructor(
    @inject(Types.LectureModel)
    private readonly lectureModel: Model<LectureDocument>
  ) {
    super(lectureModel);
  }

  async findByIdWithPopulatedData(
    lectureId: string
  ): Promise<LectureWithPopulatedData | null> {
    try {
      const lecture = await this.lectureModel
        .findById(lectureId)
        .populate("courseId");
      return lecture as unknown as LectureWithPopulatedData | null;
    } catch (error: unknown) {
      throw new DatabaseError(
        "An unexpected database error occurred",
        StatusCode.INTERNAL_SERVER_ERROR
      );
    }
  }

  async updateOrderOfLectureInSameSection(
    sectionId: mongoose.Types.ObjectId,
    lectureId: mongoose.Types.ObjectId,
    draggedOrder: number,
    targetOrder: number
  ): Promise<LectureDocument | null> {
    try {
      if (draggedOrder > targetOrder) {
        await this.lectureModel.updateMany(
          {
            sectionId,
            order: { $gte: targetOrder, $lt: draggedOrder },
          },
          { $inc: { order: 1 } }
        );
      } else {
        await this.lectureModel.updateMany(
          {
            sectionId,
            order: { $gt: draggedOrder, $lte: targetOrder },
          },
          { $inc: { order: -1 } }
        );
      }

      const updatedLecture = await this.lectureModel.findByIdAndUpdate(
        lectureId,
        {
          order: targetOrder,
        }
      );

      return updatedLecture;
    } catch (error: unknown) {
      throw new DatabaseError(
        "An unexpected database error occurred",
        StatusCode.INTERNAL_SERVER_ERROR
      );
    }
  }

  async updateOrderOfLectureInDifferentSection(
    lectureId: mongoose.Types.ObjectId,
    draggedSectionId: mongoose.Types.ObjectId,
    targetSectionId: mongoose.Types.ObjectId,
    draggedLectureOrder: number,
    targetOrder: number
  ): Promise<LectureDocument | null> {
    try {
      await this.lectureModel.updateMany(
        { sectionId: draggedSectionId, order: { $gte: draggedLectureOrder } },
        { $inc: { order: -1 } }
      );

      await this.lectureModel.updateMany(
        { sectionId: targetSectionId, order: { $gte: targetOrder } },
        { $inc: { order: 1 } }
      );
      const lecture = await this.lectureModel.findByIdAndUpdate(
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
      const lectures = await this.lectureModel
        .find({ courseId: courseId })
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
      const updatedLecture = await this.lectureModel.findByIdAndUpdate(
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
      const lectureCount = await this.lectureModel.countDocuments({
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
      const lectureCount = await this.lectureModel.countDocuments({
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
      const result = await this.lectureModel.deleteMany(filters);
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
      await this.lectureModel.updateMany(
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
      const lecture = await this.lectureModel.findByIdAndUpdate(
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
