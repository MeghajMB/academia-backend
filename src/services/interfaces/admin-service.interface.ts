import { GetUsersParams } from "../types/admin-service.types";

export interface IAdminService {
  getUsers({ role, page, limit, search }: GetUsersParams): Promise<any>;
  getCourses(page: number, limit: number, search: string): Promise<any>;
  getInstructorVerificationRequests(page: number, limit: number): Promise<any>;
  rejectVerificationRequest(rejectReason: string, userId: string): Promise<any>;
  approveVerificationRequest(userId: string): Promise<any>;
  getPaginatedCategories(page: number, limit: number): Promise<any>;
  blockUser(id: string): Promise<any>;
  blockOrUnblockCourse(id: string): Promise<any>;
  blockCategory(id: string): Promise<any>;
  createCategory(category: { name: string; description: string }): Promise<any>;
  editCategory(
    category: { name: string; description: string },
    categoryId: string
  ): Promise<any>;
  getCourseReviewRequests(page: number, limit: number): Promise<any>;
  rejectCourseReviewRequest(
    rejectReason: string,
    courseId: string
  ): Promise<any>;
  approveCourseReviewRequest(courseId: string): Promise<any>;
}
