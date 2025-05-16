import {
  GetCoursesParams,
  GetCoursesResponse,
  GetInstructorVerificationRequestsParams,
  GetUsersParams,
  RejectVerificationRequestParams,
} from "./admin.types";

export interface IAdminService {
  getUsers({ role, page, limit, search }: GetUsersParams): Promise<any>;
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
  }: RejectVerificationRequestParams): Promise<any>;
  approveVerificationRequest(userId: string): Promise<any>;
  getPaginatedCategories(page: number, limit: number): Promise<any>;
  getCourseReviewRequests(page: number, limit: number): Promise<any>;
  rejectCourseReviewRequest(
    rejectReason: string,
    courseId: string
  ): Promise<any>;
  approveCourseReviewRequest(courseId: string): Promise<any>;
}
