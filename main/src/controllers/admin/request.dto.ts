import { z } from "zod";

// Analytics
export const GetAdminAnalyticsRequestSchema = z.object({
  filter: z.enum(["month", "quarter", "year", "custom"]),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});
export type getAdminAnalyticsRequestDTO = z.infer<
  typeof GetAdminAnalyticsRequestSchema
>;

// Get Users Request
export const GetUsersRequestSchema = z.object({
  role: z.string().nonempty("Role is required"),
  page: z.coerce
    .number()
    .int()
    .transform((val) => (val < 1 ? 1 : val))
    .default(1),
  search: z.string().default(""),
});
export type GetUsersRequestDTO = z.infer<typeof GetUsersRequestSchema>;

// Get Courses Request
export const getAdminCoursesRequestSchema = z.object({
  page: z.coerce
    .number()
    .int()
    .transform((val) => (val < 1 ? 1 : val))
    .default(1),
  search: z.string().default(""),
});
export type getAdminCoursesRequestDTO = z.infer<
  typeof getAdminCoursesRequestSchema
>;

// Get Instructor Verification Requests Request
export const GetInstructorVerificationRequestsRequestSchema = z.object({
  page: z.coerce
    .number()
    .int()
    .transform((val) => (val < 1 ? 1 : val))
    .default(1),
});
export type GetInstructorVerificationRequestsRequestDTO = z.infer<
  typeof GetInstructorVerificationRequestsRequestSchema
>;

// Reject Verification Request
export const RejectVerificationRequestSchema = z.object({
  rejectReason: z.string().nonempty("Reject reason is required"),
  userId: z.string().nonempty("User ID is required"),
});
export type RejectVerificationRequestDTO = z.infer<
  typeof RejectVerificationRequestSchema
>;

// Approve Verification Request
export const ApproveVerificationRequestSchema = z.object({
  userId: z.string().nonempty("User ID is required"),
});
export type ApproveVerificationRequestDTO = z.infer<
  typeof ApproveVerificationRequestSchema
>;

// Block User Request
export const BlockUserRequestSchema = z.object({
  userId: z.string().nonempty("User ID is required"),
});
export type BlockUserRequestDTO = z.infer<typeof BlockUserRequestSchema>;

// Block Course Request
export const BlockCourseRequestSchema = z.object({
  courseId: z.string().nonempty("Course ID is required"),
});
export type BlockCourseRequestDTO = z.infer<typeof BlockCourseRequestSchema>;

// Get Categories Request
export const GetCategoriesRequestSchema = z.object({
  page: z.coerce
    .number()
    .int()
    .transform((val) => (val < 1 ? 1 : val))
    .default(1),
});
export type GetCategoriesRequestDTO = z.infer<
  typeof GetCategoriesRequestSchema
>;

// Get Course Review Requests Request
export const GetCourseReviewRequestsRequestSchema = z.object({
  page: z.coerce
    .number()
    .int()
    .transform((val) => (val < 1 ? 1 : val))
    .default(1),
});
export type GetCourseReviewRequestsRequestDTO = z.infer<
  typeof GetCourseReviewRequestsRequestSchema
>;

// Reject Course Review Request
export const RejectCourseReviewRequestSchema = z.object({
  rejectReason: z.string().nonempty("Reject reason is required"),
  courseId: z.string().nonempty("Course ID is required"),
});
export type RejectCourseReviewRequestDTO = z.infer<
  typeof RejectCourseReviewRequestSchema
>;

// Approve Course Review Request
export const ApproveCourseReviewRequestSchema = z.object({
  courseId: z.string().nonempty("Course ID is required"),
});
export type ApproveCourseReviewRequestDTO = z.infer<
  typeof ApproveCourseReviewRequestSchema
>;
