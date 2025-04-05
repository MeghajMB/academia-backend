import { z } from "zod";

// Get Users Request
export const GetUsersRequestSchema = z.object({
  role: z.string().nonempty("Role is required"),
  page: z.coerce.number().int().transform((val) => (val < 1 ? 1 : val)).default(1),
  search: z.string().default(""),
});
export type GetUsersRequestDTO = z.infer<typeof GetUsersRequestSchema>;

// Get Courses Request
export const GetCoursesRequestSchema = z.object({
  page: z.coerce.number().int().transform((val) => (val < 1 ? 1 : val)).default(1),
  search: z.string().default(""),
});
export type GetCoursesRequestDTO = z.infer<typeof GetCoursesRequestSchema>;

// Get Instructor Verification Requests Request
export const GetInstructorVerificationRequestsRequestSchema = z.object({
  page: z.coerce.number().int().transform((val) => (val < 1 ? 1 : val)).default(1),
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
  page: z.coerce.number().int().transform((val) => (val < 1 ? 1 : val)).default(1),
});
export type GetCategoriesRequestDTO = z.infer<
  typeof GetCategoriesRequestSchema
>;

// Create Category Request
export const CreateCategoryRequestSchema = z.object({
  name: z.string().nonempty("Category name is required"), 
  description:z.string().nonempty("Category description is required")
});
export type CreateCategoryRequestDTO = z.infer<
  typeof CreateCategoryRequestSchema
>;

// Edit Category Request
export const EditCategoryRequestSchema = z.object({
  categoryId: z.string().nonempty("Category ID is required"),
  category: z.object({
    name:z.string().nonempty("Category name is required"),
    description:z.string().nonempty("Category description is required")
  })
});
export type EditCategoryRequestDTO = z.infer<typeof EditCategoryRequestSchema>;

// Block Category Request
export const BlockCategoryRequestSchema = z.object({
  categoryId: z.string().nonempty("Category ID is required"),
});
export type BlockCategoryRequestDTO = z.infer<
  typeof BlockCategoryRequestSchema
>;

// Get Course Review Requests Request
export const GetCourseReviewRequestsRequestSchema = z.object({
  page: z.coerce.number().int().transform((val) => (val < 1 ? 1 : val)).default(1)
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
