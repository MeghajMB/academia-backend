import { StatusCode } from "../enums/statusCode.enum";
import { DatabaseError } from "../errors/database-error";
import { SectionModel } from "../models/sectionModel";
import {
  ISectionRepository,
  ISectionResult,
} from "./interfaces/ISectionRepository";

export class SectionRepository implements ISectionRepository {

  async findById(sectionId: string): Promise<ISectionResult | null> {
    try {
      const section = await SectionModel.findById(sectionId);
      return section;
    } catch (error: unknown) {
      throw new DatabaseError(
        "An unexpected database error occurred",
        StatusCode.INTERNAL_SERVER_ERROR
      );
    }
  }
  async getSectionsWithCourseId(courseId: string): Promise<ISectionResult[]> {
    try {
      const sections = await SectionModel.find({ courseId: courseId }).sort({
        order: 1,
      });
      return sections;
    } catch (error: unknown) {
      throw new DatabaseError(
        "An unexpected database error occurred",
        StatusCode.INTERNAL_SERVER_ERROR
      );
    }
  }
  async countDocumentsByCourseId(courseId: string): Promise<number> {
    try {
      const sectionCount = await SectionModel.countDocuments({ courseId });
      return sectionCount;
    } catch (error: unknown) {
      throw new DatabaseError(
        "An unexpected database error occurred",
        StatusCode.INTERNAL_SERVER_ERROR
      );
    }
  }
  async create(sectionData: {
    title: string;
    description: string;
    courseId: string;
  }): Promise<ISectionResult> {
    try {
      const newSection = new SectionModel(sectionData);
      await newSection.save();
      return newSection;
    } catch (error) {
      throw new DatabaseError(
        "An unexpected database error occurred",
        StatusCode.INTERNAL_SERVER_ERROR
      );
    }
  }
}
