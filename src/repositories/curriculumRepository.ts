import { StatusCode } from "../enums/statusCode.enum";
import { DatabaseError } from "../errors/database-error";
import { CurriculumModel } from "../models/curriculumModel";
import { ICurriculumResult } from "../types/courseInterface";
import { ICurriculumRepository } from "./interfaces/curriculumRepository";

export class CurriculumRepository implements ICurriculumRepository {
  async createCurriculum(
    curriculumData: { userId: string; courseId: string; sections: [] },
    transactionSession: object
  ): Promise<ICurriculumResult> {
    try {
      const newCurriculum = new CurriculumModel(curriculumData);
      const savedCurriculum = await newCurriculum.save(transactionSession);
      return savedCurriculum;
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.log(error.message);
      }
      throw new DatabaseError(
        "An unexpected database error occurred",
        StatusCode.INTERNAL_SERVER_ERROR
      );
    }
  }

  async getCurriculum(courseId: string): Promise<ICurriculumResult | null> {
    try {
      const curriculum = await CurriculumModel.findOne({ courseId: courseId });
      return curriculum;
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.log(error.message);
      }
      throw new DatabaseError(
        "An unexpected database error occurred",
        StatusCode.INTERNAL_SERVER_ERROR
      );
    }
  }
  async addSectionToCurriculum(
    courseId: string,
    section: { title: string; description: string }
  ): Promise<ICurriculumResult | null> {
    try {
      const updatedCurriculum = await CurriculumModel.findOneAndUpdate(
        { courseId: courseId },
        { $push: { sections: section } },
        { new: true }
      );
      return updatedCurriculum;
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.log(error.message);
      }
      throw new DatabaseError(
        "An unexpected database error occurred",
        StatusCode.INTERNAL_SERVER_ERROR
      );
    }
  }
}
