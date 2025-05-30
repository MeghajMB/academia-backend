import { Types } from "mongoose";
import { Course } from "../course/course.types";

/* Core Enrollment types */

export interface Enrollment {
  _id: Types.ObjectId;
  studentId: Types.ObjectId;
  courseId: Types.ObjectId;
  transactionId: Types.ObjectId;
  purchaseDate: Date;
  status: "active" | "refunded" | "expired";
  reviewStatus: boolean;
  progress: EnrollmentProgress;
  completedAt?: Date;
  certificateUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface EnrollmentProgress {
  completedLectures: Types.ObjectId[];
  percentage: number;
  awarded50Percent: boolean;
  awarded100Percent: boolean;
}

/* Other types */

export type EnrollmentWithCourse = Omit<Enrollment, "courseId"> & {
  courseId: Course; // Populated course object
};

export interface AggregatedStudentGrowth {
  date: string;
  count: number;
}

export interface EnrollmentAnalyticsResult {
  date: string; 
  enrollmentCount: number;
}
