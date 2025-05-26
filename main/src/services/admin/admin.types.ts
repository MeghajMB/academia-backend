import { CourseDocument } from "../../models/course.model";
import { CourseWithPopulatedCategory } from "../../repositories/course/course.types";
import { Pagination } from "../../types";

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
    status:
      | "listed"
      | "pending"
      | "accepted"
      | "rejected"
      | "draft"
      | "scheduled";
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

export interface GetUsersResponse {
  users: {
    id: string;
    name: string;
    email: string;
    profilePicture: string;
    isBlocked: boolean;
  }[];
  pagination: Pagination;
}
