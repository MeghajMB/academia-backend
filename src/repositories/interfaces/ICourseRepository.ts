import mongoose from "mongoose";
import { ICourseResult, ICourseResultWithUserId } from "../../types/course.interface";
import { FilterQuery } from "mongoose";
import { ICourseDocument } from "../../models/courseModel";

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
  findNewCourses(): Promise<ICourseResult[]>
  fetchCoursesWithInstrucorIdAndStatus(
    instructorId: string,
    status: string
  ): Promise<ICourseResult[] | null>;
  findCourseByName(title: string): Promise<ICourseResult | null>;
  findCoursesWithFilter(filter: FilterQuery<ICourseDocument>):  Promise<ICourseResult[] | null>;
  findById(courseId: string): Promise<ICourseResult | null>;
  findByIdWithInstructorData(courseId: string): Promise<ICourseResultWithUserId | null>
  countDocuments(key: string, value: string): Promise<number>;
  fetchPaginatedCoursesWithFilters(
    filters: { [key: string]: any },
    skip: number,
    limit: number
  ): Promise<ICourseResult[]>;
  rejectCourseReviewRequest(courseId: string,rejectReason:string): Promise<ICourseResult | null>;
  approveCourseReviewRequest(courseId: string): Promise<ICourseResult | null>;
  changeCourseStatusWithInstructorIdAndCourseId(
    instructorId: string,
    courseId: string,
    status:'pending'|'listed'
  ): Promise<ICourseResult | null>
  // Additional methods like getUser, updateUser, etc.
}
