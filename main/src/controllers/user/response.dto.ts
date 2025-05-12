import { z } from "zod";
import { SuccessResponseSchema } from "../shared-response.dto";

// Add Review Response
export const GetInstructorProfileResponseSchema = SuccessResponseSchema.extend({
  message: z.string(),
  data: z.object({
    id: z.string(),
    name: z.string(),
    role: z.enum(["student", "instructor"]),
    email:z.string(),
    purpleCoin: z.number(),
    profilePicture: z.string().url(),
    headline: z.string().optional(),
    verified: z.enum(["pending", "rejected", "notRequested", "verified"]),
    biography: z.string().optional(),
    links: z.object({
      facebook: z.string().url().optional(),
      linkedin: z.string().url().optional(),
      twitter: z.string().url().optional(),
      website: z.string().url().optional(),
    }).optional(),
    createdAt: z.string(),
  }),
});
export type GetInstructorProfileResponseDTO = z.infer<typeof GetInstructorProfileResponseSchema>;