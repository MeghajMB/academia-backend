import mongoose from "mongoose";
import { FilterQuery } from "mongoose";
import { CourseDocument } from "../../models/course.model";
import { IRepository } from "../base/base-repository.interface";
import { CourseWithPopulatedFields } from "../types/course-repository.types";

export interface ICourseRepository extends IRepository<CourseDocument> {
  createCourseWithSession(
    course: Partial<CourseDocument>,
    session: { session: mongoose.mongo.ClientSession }
  ): Promise<CourseDocument>;
  findNewCourses(): Promise<CourseDocument[]>;
  fetchCoursesWithInstrucorIdAndStatus(
    instructorId: string,
    status: string
  ): Promise<CourseDocument[] | null>;
  findCourseByName(title: string): Promise<CourseDocument | null>;
  findCoursesWithFilter(
    filter: FilterQuery<CourseDocument>
  ): Promise<CourseDocument[] | null>;
  toggleCourseStatus(courseId: string): Promise<CourseDocument | null>;
  findByIdWithPopulatedData(
    courseId: string
  ): Promise<CourseWithPopulatedFields | null>;
  countDocuments(key: string, value: string): Promise<number>;
  fetchPaginatedCoursesWithFilters(
    filters: { [key: string]: any },
    skip: number,
    limit: number
  ): Promise<CourseDocument[]>;
  rejectCourseReviewRequest(
    courseId: string,
    rejectReason: string
  ): Promise<CourseDocument | null>;
  approveCourseReviewRequest(courseId: string): Promise<CourseDocument | null>;
  changeCourseStatusWithInstructorIdAndCourseId(
    instructorId: string,
    courseId: string,
    status: "pending" | "listed"
  ): Promise<CourseDocument | null>;
  // Additional methods like getUser, updateUser, etc.
}
