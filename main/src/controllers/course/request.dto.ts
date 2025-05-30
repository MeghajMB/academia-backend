import { z } from "zod";

// Create Course Request
export const CreateCourseRequestSchema = z.object({
  category: z.string().nonempty("Category is required"),
  imageThumbnail: z.string().nonempty("Image thumbnail is required"),
  description: z.string().nonempty("Description is required"),
  price: z.number().min(0, "Price must be non-negative"),
  subtitle: z.string().nonempty("Subtitle is required"),
  title: z.string().nonempty("Title is required"),
  promotionalVideo: z.string().nonempty("Promotional video is required"),
});
export type CreateCourseRequestDTO = z.infer<typeof CreateCourseRequestSchema>;

// List courses Request
export const GetCoursesRequestSchema = z.object({
  sort: z.string().optional(),
  category: z.string().optional(),
  page: z.string().optional(),
  search: z.string().optional(),
  limit: z.number(),
});
export type GetCoursesRequestDTO = z.infer<typeof GetCoursesRequestSchema>;


// Get Curriculum Request
export const GetCurriculumRequestSchema = z.object({
  courseId: z.string().nonempty("Course ID is required"),
  status: z.string().nonempty("Status is required"),
});
export type GetCurriculumRequestDTO = z.infer<
  typeof GetCurriculumRequestSchema
>;

// Get Course Details Request
export const GetCourseDetailsRequestSchema = z.object({
  courseId: z.string().nonempty("Course ID is required"),
});
export type GetCourseDetailsRequestDTO = z.infer<
  typeof GetCourseDetailsRequestSchema
>;

// Get Course Creation Details Request
export const GetCourseCreationDetailsRequestSchema = z.object({
  courseId: z.string().nonempty("Course ID is required"),
});
export type GetCourseCreationDetailsRequestDTO = z.infer<
  typeof GetCourseCreationDetailsRequestSchema
>;

// Edit Course Creation Details Request
export const EditCourseCreationDetailsRequestSchema = z.object({
  courseId: z.string().nonempty("Course ID is required"),
  category: z.string().nonempty("Category is required"),
  imageThumbnail: z.string().nullable(),
  description: z.string().nonempty("Description is required"),
  price: z.coerce.number().min(0, "Price must be non-negative"),
  subtitle: z.string().nonempty("Subtitle is required"),
  title: z.string().nonempty("Title is required"),
  promotionalVideo: z.string().nullable(),
});
export type EditCourseCreationDetailsRequestDTO = z.infer<
  typeof EditCourseCreationDetailsRequestSchema
>;

// Add Processed Lecture Request
export const AddProcessedLectureRequestSchema = z.object({
  userId: z.string().nonempty("User ID is required"),
  courseId: z.string().nonempty("Course ID is required"),
  sectionId: z.string().nonempty("Section ID is required"),
  lectureId: z.string().nonempty("Lecture ID is required"),
  key: z.string().nonempty("Key is required"),
});
export type AddProcessedLectureRequestDTO = z.infer<
  typeof AddProcessedLectureRequestSchema
>;

// Get Courses Of Instructor Request
export const GetCoursesOfInstructorRequestSchema = z.object({
  instructorId: z.string().nonempty("Instructor ID is required"),
  status: z.string().nonempty("Status is required"),
});
export type GetCoursesOfInstructorRequestDTO = z.infer<
  typeof GetCoursesOfInstructorRequestSchema
>;



// Submit Course For Review Request
export const SubmitCourseForReviewRequestSchema = z.object({
  courseId: z.string().nonempty("Course ID is required"),
});
export type SubmitCourseForReviewRequestDTO = z.infer<
  typeof SubmitCourseForReviewRequestSchema
>;

// List Course Request
export const ListCourseRequestSchema = z.object({
  courseId: z.string().nonempty("Course ID is required"),
  scheduleDate:z.string().nonempty("Date is required")
});
export type ListCourseRequestDTO = z.infer<typeof ListCourseRequestSchema>;

// GetCourseAnalytics
export const GetCourseAnalyticsRequestSchema = z.object({
  filter: z.enum(["month", "quarter", "year"]),
  courseId: z.string(),
});
export type GetCourseAnalyticsRequestDTO = z.infer<
  typeof GetCourseAnalyticsRequestSchema
>;
