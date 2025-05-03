import { z } from "zod";

export const SuccessResponseSchema = z.object({
  status: z.literal("success"),
  code: z.number(),
  message: z.string(),
  data: z.any(),
});

export const NullResponseSchema = SuccessResponseSchema.extend({
  data: z.null(),
});
export type NullResponseDTO = z.infer<typeof NullResponseSchema>;
