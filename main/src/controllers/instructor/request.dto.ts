import { z } from "zod";

export const GetAnalyticsRequestSchema = z.object({
  filter: z.enum(["month", "quarter", "year"]),
});
export type getAnalyticsRequestDTO = z.infer<typeof GetAnalyticsRequestSchema>;
