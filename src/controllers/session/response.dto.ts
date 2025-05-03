import { z } from "zod";
import { SuccessResponseSchema } from "../shared-response.dto";

export const GetSessionsOfUserResponseSchema = SuccessResponseSchema.extend({
  message: z.string(),
  data: z.object({
    pagination: z.object({
      totalDocuments: z.number(),
      totalPages: z.number(),
      currentPage: z.number(),
      limit: z.number(),
    }),
    sessionDetails: z.array(
      z.object({
        id: z.string(),
        sessionDate: z.string(),
        sessionDuration: z.number(),
        status: z.enum(["scheduled", "in-progress", "completed", "missed"]),
        description:z.string(),
        instructor: z.object({
          id: z.string(),
          name: z.string(),
        }),
        gigId: z.string(),
        sessionId: z.string(),
        title: z.string(),
      })
    ),
  }),
});
export type GetSessionsOfUserResponseDTO = z.infer<
  typeof GetSessionsOfUserResponseSchema
>;
