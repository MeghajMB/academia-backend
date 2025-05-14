import { z } from "zod";
import { SuccessResponseSchema } from "../../shared-response.dto";

// Add Section Response
export const AddSectionResponseSchema = SuccessResponseSchema.extend({
  data: z.object({
    id: z.string(),
    title: z.string(),
    description: z.string(),
    courseId: z.string(),
    order: z.number(),
  }),
});
export type AddSectionResponseDTO = z.infer<typeof AddSectionResponseSchema>;


// Edit Section Response
export const EditSectionResponseSchema = SuccessResponseSchema.extend({
    data: z.object({
      id: z.string(),
    }),
  });
  export type EditSectionResponseDTO = z.infer<typeof EditSectionResponseSchema>;