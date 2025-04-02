import { StatusCode } from "../../enums/status-code.enum";
import { DatabaseError } from "../../util/errors/database-error";
import { SectionDocument, SectionModel } from "../../models/section.model";
import { BaseRepository } from "../base/base.repository";
import { SectionResultWithCourse } from "../types/section-repository.types";
import { ISectionRepository } from "../interfaces/section-repository.interface";


export class SectionRepository
  extends BaseRepository<SectionDocument>
  implements ISectionRepository
{
  constructor() {
    super(SectionModel);
  }
  async findByIdWithPopulatedData(
    sectionId: string
  ): Promise<SectionResultWithCourse | null> {
    try {
      const section = await SectionModel.findById(sectionId).populate(
        "courseId"
      );
      return section as unknown as SectionResultWithCourse | null;
    } catch (error: unknown) {
      throw new DatabaseError(
        "An unexpected database error occurred",
        StatusCode.INTERNAL_SERVER_ERROR
      );
    }
  }

  async getSectionsWithCourseId(courseId: string): Promise<SectionDocument[]> {
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
