import { StatusCode } from "../../enums/status-code.enum";
import { DatabaseError } from "../../util/errors/database-error";
import { ISectionDocument, SectionModel } from "../../models/section.model";
import { BaseRepository } from "../base/base.repository";
import {
  ISectionRepository,
  ISectionResult,
  ISectionResultWithCourse,
} from "../interfaces/section-repository.interface";

export class SectionRepository
  extends BaseRepository<ISectionDocument>
  implements ISectionRepository
{
  constructor() {
    super(SectionModel);
  }
  async findByIdWithPopulatedData(
    sectionId: string
  ): Promise<ISectionResultWithCourse | null> {
    try {
      const section = await SectionModel.findById(sectionId).populate(
        "courseId"
      );
      return section as unknown as ISectionResultWithCourse | null;
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
}
