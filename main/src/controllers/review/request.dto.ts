import { z } from "zod";

// Add Review Request
export const AddReviewRequestSchema = z.object({
  courseId: z.string().nonempty("Course ID is required"),
  rating: z.coerce
    .number()
    .min(1, "Rating must be at least 1")
    .max(5, "Rating cannot exceed 5"),
  comment: z.string().nonempty("Comment is required"),
});
export type AddReviewRequestDTO = z.infer<typeof AddReviewRequestSchema>;

// Get Reviews Of Course Request
export const GetReviewsOfCourseRequestSchema = z.object({
  courseId: z.string().nonempty("Course ID is required"),
  userId: z.string().optional(),
});
export type GetReviewsOfCourseRequestDTO = z.infer<
  typeof GetReviewsOfCourseRequestSchema
>;

// Get Reviews By Student Request
export const GetReviewsByStudentRequestSchema = z.object({
  studentId: z.string().nonempty("Student ID is required"),
});
export type GetReviewsByStudentRequestDTO = z.infer<
  typeof GetReviewsByStudentRequestSchema
>;

// Delete Review Request
export const DeleteReviewRequestSchema = z.object({
  reviewId: z.string().nonempty("Review ID is required"),
});
export type DeleteReviewRequestDTO = z.infer<typeof DeleteReviewRequestSchema>;

// Edit Review Request
export const EditReviewRequestSchema = z.object({
  courseId: z.string(),
  comment: z.string(),
  reviewId: z.string(),
  rating: z.number(),
});
export type EditReviewRequestDTO = z.infer<typeof EditReviewRequestSchema>;
