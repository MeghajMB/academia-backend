import mongoose from "mongoose";
import { FilterQuery } from "mongoose";
import { CourseDocument } from "../../models/course.model";
import { IRepository } from "../base/base.interface";
import {
  CourseWithPopulatedCategory,
  CourseWithPopulatedFields,
  FetchAllPaginatedCoursesResult,
  fetchCourseMetricsRepositoryResponse,
  getAnalyticsResponse,
  getAnalyticsSummaryResponse,
} from "./course.types";

export interface ICourseRepository extends IRepository<CourseDocument> {
  getAnalyticsSummary(courseId: string, userId: string): Promise<getAnalyticsSummaryResponse>;
  getAnalytics(
    courseId: string,
    userId: string,
    start: Date,
    end: Date,
    filter:'month'|'quarter'|'year'
  ): Promise<[getAnalyticsResponse] | []>;

  fetchCourseMetrics(
    userId: string
  ): Promise<fetchCourseMetricsRepositoryResponse[] | []>;

  findAllPaginatedCourses({
    query,
    skip,
    sort,
    limit,
  }: {
    query: Record<any, any>;
    skip: number;
    sort: Record<any, any>;
    limit: number;
  }): Promise<FetchAllPaginatedCoursesResult[]>;
  createCourseWithSession(
    course: Partial<CourseDocument>,
    session: { session: mongoose.mongo.ClientSession }
  ): Promise<CourseDocument>;
  findNewCourses(): Promise<CourseWithPopulatedCategory[]>;
  fetchCoursesWithInstrucorIdAndStatus(
    instructorId: string,
    status: "pending" | "accepted" | "rejected" | "draft" | "listed"
  ): Promise<CourseDocument[]>;
  findCourseByName(title: string): Promise<CourseDocument | null>;
  findCoursesWithFilter(
    filter: FilterQuery<CourseDocument>
  ): Promise<CourseWithPopulatedCategory[]>;
  toggleCourseStatus(courseId: string): Promise<CourseDocument | null>;
  findByIdWithPopulatedData(
    courseId: string
  ): Promise<CourseWithPopulatedFields | null>;
  countDocuments(key: string, value: string): Promise<number>;
  fetchPaginatedCoursesWithFilters(
    filters: Record<string, any>,
    skip: number,
    limit: number
  ): Promise<CourseWithPopulatedCategory[]>;
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
