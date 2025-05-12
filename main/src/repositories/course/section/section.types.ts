import { CourseDocument } from "../../../models/course.model";
import { SectionDocument } from "../../../models/section.model";

export interface SectionResultWithCourse
  extends Omit<SectionDocument, "courseId"> {
  courseId: CourseDocument;
}
