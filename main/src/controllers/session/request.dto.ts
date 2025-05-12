import { z } from "zod";

export const GetSessionsOfUserRequestSchema = z.object({
  status: z
    .enum(["scheduled", "in-progress", "completed", "missed", "all"])
    .optional(),
  page: z.coerce.number().min(1),
  search: z.string().optional(),
  limit: z.number(),
});
export type GetSessionsOfUserRequestDTO = z.infer<
  typeof GetSessionsOfUserRequestSchema
>;
