import { IRepository } from "../../base/base.interface";
import { SectionDocument } from "../../../models/section.model";

import { SectionResultWithCourse } from "./section.types";

export interface ISectionRepository extends IRepository<SectionDocument> {
  getSectionsWithCourseId(courseId: string): Promise<SectionDocument[]>;
  countDocumentsByCourseId(courseId: string): Promise<number>;
  findByIdWithPopulatedData(
    sectionId: string
  ): Promise<SectionResultWithCourse | null>;

}
