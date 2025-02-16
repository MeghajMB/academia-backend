import { StatusCode } from "../enums/statusCode.enum";
import { DatabaseError } from "../errors/database-error";
import { LectureModel } from "../models/lectureModel";
import {
  ILectureRepository,
  ILectureResult,
} from "./interfaces/ILectureRepository";

export class LectureRepository implements ILectureRepository {

  async create(lectureData: {
    title: string;
    videoUrl: string;
    duration: number;
    order: number;
  }): Promise<ILectureResult> {
    try {
      const newLecture = await LectureModel.create(lectureData);
      return newLecture;
    } catch (error: unknown) {
      console.log(error)
      throw new DatabaseError(
        "An unexpected database error occurred",
        StatusCode.INTERNAL_SERVER_ERROR
      );
    }
  }
  async findById(lectureId:string): Promise<ILectureResult|null> {
    try {
      const lecture = await LectureModel.findById(lectureId);
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
      const lectures = await LectureModel.find({ courseId: courseId });
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
      throw new DatabaseError(
        "An unexpected database error occurred",
        StatusCode.INTERNAL_SERVER_ERROR
      );
    }
  }
}
