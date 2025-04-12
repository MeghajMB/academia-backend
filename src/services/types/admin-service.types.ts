import { CourseDocument } from "../../models/course.model";
import { CourseWithPopulatedCategory } from "../../repositories/types/course-repository.types";

interface Pagination {
  totalDocuments: number;
  totalPages: number;
  currentPage: number;
  limit: number;
}

export interface GetUsersParams {
  role: string;
  page: number;
  limit: number;
  search: string;
}

export interface GetCoursesParams {
  page: number;
  limit: number;
  search: string;
}
export interface GetCoursesResponse {
  courses: {
    id: string;
    title: string;
    price: number;
    isBlocked: boolean;
    category: {
      name: string;
      description: string;
    };
    status: "listed" | "pending" | "accepted" | "rejected" | "draft";
  }[];
  pagination: Pagination;
}
export interface GetInstructorVerificationRequestsParams {
  page: number;
  limit: number;
}
export interface RejectVerificationRequestParams {
  rejectReason: string;
  userId: string;
}
