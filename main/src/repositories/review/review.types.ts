import { ReviewDocument } from "../../models/review.model";
import { UserDocument } from "../../models/user.model";

export interface ReviewWithPopulatedStudentId
  extends Omit<ReviewDocument, "studentId"> {
  studentId: UserDocument;
}
