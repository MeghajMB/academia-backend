import {
  GetCoursesParams,
  GetCoursesResponse,
  GetInstructorVerificationRequestsParams,
  GetUsersParams,
  GetUsersResponse,
  RejectVerificationRequestParams,
} from "./admin.types";

export interface IAdminService {
  getUsers({ role, page, limit, search }: GetUsersParams): Promise<GetUsersResponse>;
  getCourses({
    page,
    limit,
    search,
  }: GetCoursesParams): Promise<GetCoursesResponse>;
  getInstructorVerificationRequests({
    page,
    limit,
  }: GetInstructorVerificationRequestsParams): Promise<any>;
  rejectVerificationRequest({
    rejectReason,
    userId,
  }: RejectVerificationRequestParams): Promise<{message:string}>;
  approveVerificationRequest(userId: string): Promise<{message:string}>;
  getPaginatedCategories(page: number, limit: number): Promise<any>;
  getCourseReviewRequests(page: number, limit: number): Promise<any>;
  rejectCourseReviewRequest(
    rejectReason: string,
    courseId: string
  ): Promise<{message:string}>;
  approveCourseReviewRequest(courseId: string): Promise<{message:string}>;
}
