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
// Add Section Request
export const AddSectionRequestSchema = z.object({
  courseId: z.string().nonempty("Course ID is required"),
  section: z.object({
    title: z.string().nonempty("Section title is required"),
    description: z.string().nonempty("Section description is required"),
  }),
});
export type AddSectionRequestDTO = z.infer<typeof AddSectionRequestSchema>;

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

// Add Lecture Request
export const AddLectureRequestSchema = z.object({
  courseId: z.string().nonempty("Course ID is required"),
  sectionId: z.string().nonempty("Section ID is required"),
  lectureData: z.object({
    title: z.string().nonempty("Lecture title is required"),
    videoUrl: z.string().nonempty("Video URL is required"),
    duration: z.coerce.number().min(0, "Duration must be non-negative"),
  }),
});
export type AddLectureRequestDTO = z.infer<typeof AddLectureRequestSchema>;

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

// Generate Lecture URL Request
export const GenerateLectureUrlRequestSchema = z.object({
  courseId: z.string().nonempty("Course ID is required"),
  lectureId: z.string().nonempty("Lecture ID is required"),
});
export type GenerateLectureUrlRequestDTO = z.infer<
  typeof GenerateLectureUrlRequestSchema
>;

// Get Courses Of Instructor Request
export const GetCoursesOfInstructorRequestSchema = z.object({
  instructorId: z.string().nonempty("Instructor ID is required"),
  status: z.string().nonempty("Status is required"),
});
export type GetCoursesOfInstructorRequestDTO = z.infer<
  typeof GetCoursesOfInstructorRequestSchema
>;

// Delete Lecture Request
export const DeleteLectureRequestSchema = z.object({
  lectureId: z.string().nonempty("Lecture ID is required"),
});
export type DeleteLectureRequestDTO = z.infer<
  typeof DeleteLectureRequestSchema
>;

// Delete Section Request
export const DeleteSectionRequestSchema = z.object({
  sectionId: z.string().nonempty("Section ID is required"),
});
export type DeleteSectionRequestDTO = z.infer<
  typeof DeleteSectionRequestSchema
>;

// Submit Course For Review Request
export const SubmitCourseForReviewRequestSchema = z.object({
  courseId: z.string().nonempty("Course ID is required"),
});
export type SubmitCourseForReviewRequestDTO = z.infer<
  typeof SubmitCourseForReviewRequestSchema
>;

// Mark Lecture As Completed Request
export const MarkLectureAsCompletedRequestSchema = z.object({
  courseId: z.string().nonempty("Course ID is required"),
  lectureId: z.string().nonempty("Lecture ID is required"),
});
export type MarkLectureAsCompletedRequestDTO = z.infer<
  typeof MarkLectureAsCompletedRequestSchema
>;

// List Course Request
export const ListCourseRequestSchema = z.object({
  courseId: z.string().nonempty("Course ID is required"),
});
export type ListCourseRequestDTO = z.infer<typeof ListCourseRequestSchema>;

// Change Order Of Lecture Request
export const ChangeOrderOfLectureRequestSchema = z.object({
  draggedLectureId: z.string().nonempty("Dragged lecture ID is required"),
  targetLectureId: z.string().nonempty("Target lecture ID is required"),
});
export type ChangeOrderOfLectureRequestDTO = z.infer<
  typeof ChangeOrderOfLectureRequestSchema
>;

// Edit Lecture Request
export const EditLectureRequestSchema = z.object({
  lectureId: z.string().nonempty("Lecture ID is required"),
  lectureData: z.object({
    title: z.string().nonempty("Lecture title is required"),
    videoUrl: z.string().nonempty("Video URL is required"),
    duration: z.coerce.number().min(0, "Duration must be non-negative"),
  }),
});
export type EditLectureRequestDTO = z.infer<typeof EditLectureRequestSchema>;

// Edit Section Request
export const EditSectionRequestSchema = z.object({
  sectionId: z.string().nonempty("Section ID is required"),
  sectionData: z.object({
    title: z.string().nonempty("Section title is required"),
    description: z.string().nonempty("Section description is required"),
  }),
});
export type EditSectionRequestDTO = z.infer<typeof EditSectionRequestSchema>;

// GetCourseAnalytics
export const GetCourseAnalyticsRequestSchema = z.object({
  filter: z.enum(["month", "quarter", "year"]),
  courseId:z.string()
});
export type GetCourseAnalyticsRequestDTO = z.infer<
  typeof GetCourseAnalyticsRequestSchema
>;
