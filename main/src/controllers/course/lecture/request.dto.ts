import { z } from "zod";

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

// Change Order Of Lecture Request
export const ChangeOrderOfLectureRequestSchema = z.object({
  draggedLectureId: z.string().nonempty("Dragged lecture ID is required"),
  targetLectureId: z.string().nonempty("Target lecture ID is required"),
});
export type ChangeOrderOfLectureRequestDTO = z.infer<
  typeof ChangeOrderOfLectureRequestSchema
>;

// Delete Lecture Request
export const DeleteLectureRequestSchema = z.object({
  lectureId: z.string().nonempty("Lecture ID is required"),
});
export type DeleteLectureRequestDTO = z.infer<
  typeof DeleteLectureRequestSchema
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

// Generate Lecture URL Request
export const GenerateLectureUrlRequestSchema = z.object({
  courseId: z.string().nonempty("Course ID is required"),
  lectureId: z.string().nonempty("Lecture ID is required"),
});
export type GenerateLectureUrlRequestDTO = z.infer<
  typeof GenerateLectureUrlRequestSchema
>;

// Mark Lecture As Completed Request
export const MarkLectureAsCompletedRequestSchema = z.object({
  courseId: z.string().nonempty("Course ID is required"),
  lectureId: z.string().nonempty("Lecture ID is required"),
});
export type MarkLectureAsCompletedRequestDTO = z.infer<
  typeof MarkLectureAsCompletedRequestSchema
>;
