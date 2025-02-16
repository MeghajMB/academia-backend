import mongoose from "mongoose";
import { ICourseResult } from "../../types/course.interface";

export interface ICourse {
  userId:string
  category: string;
  imageThumbnail: string;
  description: string;
  price: number;
  subtitle: string;
  title: string;
  promotionalVideo: string;
}

export interface ICourseRepository {
  createCourse(course: ICourse, session: {session:mongoose.mongo.ClientSession}): Promise<ICourseResult>;
  fetchCoursesWithInstrucorIdAndStatus(
    instructorId: string,
    status: string
  ): Promise<ICourseResult[] | null>;
  findCourseByName(title: string): Promise<ICourseResult | null>;
  findById(courseId: string): Promise<ICourseResult | null>;
  countDocuments(key: string, value: string): Promise<number>;
  fetchPaginatedCoursesWithFilters(
    filters: { [key: string]: any },
    skip: number,
    limit: number
  ): Promise<ICourseResult[]>;
  rejectCourseReviewRequest(courseId: string,rejectReason:string): Promise<ICourseResult | null>;
  approveCourseReviewRequest(courseId: string): Promise<ICourseResult | null>;
  submitCourseForReview(
    instructorId: string,
    courseId: string
  ): Promise<ICourseResult | null>
  // Additional methods like getUser, updateUser, etc.
}
