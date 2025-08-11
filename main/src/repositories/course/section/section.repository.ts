import { StatusCode } from "../../../enums/status-code.enum";
import { DatabaseError } from "../../../util/errors/database-error";
import { SectionDocument } from "../../../models/section.model";
import { BaseRepository } from "../../base/base.repository";
import { SectionResultWithCourse } from "./section.types";
import { ISectionRepository } from "./section.interface";
import { inject, injectable } from "inversify";
import { Types } from "../../../container/types";
import { Model } from "mongoose";

@injectable()
export class SectionRepository
  extends BaseRepository<SectionDocument>
  implements ISectionRepository
{
  constructor(
    @inject(Types.SectionModel)
    private readonly sectionModel: Model<SectionDocument>
  ) {
    super(sectionModel);
  }
  async findByIdWithPopulatedData(
    sectionId: string
  ): Promise<SectionResultWithCourse | null> {
    try {
      const section = await this.sectionModel
        .findById(sectionId)
        .populate("courseId");
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
      const sections = await this.sectionModel
        .find({ courseId: courseId })
        .sort({
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
      const sectionCount = await this.sectionModel.countDocuments({ courseId });
      return sectionCount;
    } catch (error: unknown) {
      throw new DatabaseError(
        "An unexpected database error occurred",
        StatusCode.INTERNAL_SERVER_ERROR
      );
    }
  }
}
