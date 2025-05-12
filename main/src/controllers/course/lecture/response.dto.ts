import { z } from "zod";
import { SuccessResponseSchema } from "../../shared-response.dto";

// Add Lecture Response
export const AddLectureResponseSchema = SuccessResponseSchema.extend({
  data: z.object({
    id: z.string(),
    title: z.string(),
    videoUrl: z.string(),
    duration: z.number(),
    order: z.number(),
    status: z.string(),
    sectionId: z.string(),
    progress: z.enum(["completed", "not completed", "locked", "instructor"]),
  }),
});
export type AddLectureResponseDTO = z.infer<typeof AddLectureResponseSchema>;

// Edit Lecture Response
export const EditLectureResponseSchema = SuccessResponseSchema.extend({
  data: z.object({
    id: z.string(),
    title: z.string(),
    videoUrl: z.string(),
    duration: z.number(),
  }),
});
export type EditLectureResponseDTO = z.infer<typeof EditLectureResponseSchema>;

// Generate Lecture URL Response
export const GenerateLectureUrlResponseSchema = SuccessResponseSchema.extend({
  data: z.object({
    url: z.string(),
  }),
});
export type GenerateLectureUrlResponseDTO = z.infer<
  typeof GenerateLectureUrlResponseSchema
>;

// Mark Lecture As Completed Response
export const MarkLectureAsCompletedResponseSchema =
  SuccessResponseSchema.extend({
    data: z.object({
      lectureId: z.string(),
      completed: z.boolean(),
    }),
  });
export type MarkLectureAsCompletedResponseDTO = z.infer<
  typeof MarkLectureAsCompletedResponseSchema
>;
