import { CourseDocument } from "../../models/course.model";
import { ReviewDocument } from "../../models/review.model";
import { UserDocument } from "../../models/user.model";

export interface ReviewWithPopulatedStudentId
  extends Omit<ReviewDocument, "studentId"> {
  studentId: UserDocument;
}

export interface ReviewWithPopulatedCourseId
  extends Omit<ReviewDocument, "courseId"> {
  courseId: CourseDocument;
}

export interface ReviewAnalyticsResult {
  totalReviews: number;
  averageRating: number;
  ratings: { rating: 1 | 2 | 3 | 4 | 5; count: number }[];
}[]
