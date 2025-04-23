import { CourseDocument } from "../../models/course.model";
import { LectureDocument } from "../../models/lecture.model";

export interface LectureWithPopulatedData
  extends Omit<LectureDocument, "courseId"> {
  courseId: CourseDocument;
}
