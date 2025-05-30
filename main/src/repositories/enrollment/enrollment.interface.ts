import { EnrollmentDocument } from "../../models/enrollment.model";
import { IRepository } from "../base/base.interface";
import { ClientSession, RootFilterQuery } from "mongoose";
import {
  AggregatedStudentGrowth,
  Enrollment,
  EnrollmentAnalyticsResult,
  EnrollmentWithCourse,
} from "./enrollment.types";

export interface IEnrollmentRepository extends IRepository<EnrollmentDocument> {
  fetchAdminEnrollmentAnalytics(
    matchStage: Record<string, any>,
    dateGroup: "daily" | "monthly" | "yearly"
  ): Promise<{
    metrics: EnrollmentAnalyticsResult[];
    summary: {
      enrollmentCount: number;
    };
  }>;
  getStudentGrowth(
    userId: string,
    filter: "quarter" | "month" | "year",
    start: Date,
    end: Date
  ): Promise<AggregatedStudentGrowth[] | []>;
  getEnrollmentMetrics(courseId: string): Promise<EnrollmentDocument[]>;
  countWithFilter(
    filter: RootFilterQuery<EnrollmentDocument> | undefined
  ): Promise<number>;
  createEnrollmentWithSession(
    courseId: string,
    userId: string,
    transactionId: string,
    session: ClientSession
  ): Promise<EnrollmentDocument>;
  findOneByFilter(
    filter: Partial<Record<keyof EnrollmentDocument, any>>
  ): Promise<Enrollment | null>;
  findByStudentId(studentId: string): Promise<EnrollmentWithCourse[]>;
  updateEnrollmentProgress(
    enrollmentId: string,
    lectureId: string,
    progressPercentage: number,
    awarded50Percent: boolean,
    awarded100Percent: boolean
  ): Promise<EnrollmentDocument | null>;
}
