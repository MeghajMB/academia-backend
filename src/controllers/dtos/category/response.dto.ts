import { z } from "zod";

const SuccessResponseSchema = z.object({
  status: z.literal("success"),
  code: z.number(),
  message: z.string(),
  data: z.any(),
});

// Sign In Response
export const GetAllCategoriesSchema = SuccessResponseSchema.extend({
  data: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      description: z.string(),
      isBlocked: z.boolean(),
      createdAt: z.string(),
      updatedAt: z.string(),
    })
  ),
});

export type GetAllCategoriesDTO = z.infer<typeof GetAllCategoriesSchema>;

