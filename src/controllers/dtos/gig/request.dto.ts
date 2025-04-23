// src/dtos/gig.dto.ts
import { z } from "zod";

export const GetGigsOfInstructorRequestSchema = z.object({
  sort: z.string().optional(),
  status: z
    .enum(["active", "expired", "completed", "no-bids", "missed"])
    .optional(),
  page: z.string().optional(),
  search: z.string().optional(),
  limit: z.number(),
});
export type GetGigsOfInstructorRequestDTO = z.infer<typeof GetGigsOfInstructorRequestSchema>;

// Create Gig Request
export const CreateGigRequestSchema = z.object({
  sessionDate: z.string().nonempty("Session date is required"),
  description: z.string().nonempty("Description is required"),
  biddingAllowed: z.boolean(),
  sessionDuration: z.coerce
    .number()
    .min(1, "Session duration must be positive"),
  maxParticipants: z.coerce
    .number()
    .min(1, "Max participants must be positive"),
  minBid: z.coerce.number().min(0, "Minimum bid must be non-negative"),
  title: z.string().nonempty("Title is required"),
});
export type CreateGigRequestDTO = z.infer<typeof CreateGigRequestSchema>;

// Get Gig By ID Request
export const GetGigByIdRequestSchema = z.object({
  gigId: z.string().nonempty("Gig ID is required"),
});
export type GetGigByIdRequestDTO = z.infer<typeof GetGigByIdRequestSchema>;

// Get Active Gigs Of Instructor Request
export const GetActiveGigsOfInstructorRequestSchema = z.object({
  instructorId: z.string().nonempty("Instructor ID is required"),
});
export type GetActiveGigsOfInstructorRequestDTO = z.infer<
  typeof GetActiveGigsOfInstructorRequestSchema
>;

// Update Gig Request
export const UpdateGigRequestSchema = z.object({
  id: z.string().nonempty("Gig ID is required"),
  sessionDate: z.string().nonempty("Session date is required").optional(),
  description: z.string().nonempty("Description is required").optional(),
  biddingAllowed: z.boolean().optional(),
  sessionDuration: z.coerce
    .number()
    .min(1, "Session duration must be positive")
    .optional(),
  maxParticipants: z.coerce
    .number()
    .min(1, "Max participants must be positive")
    .optional(),
  minBid: z.coerce
    .number()
    .min(0, "Minimum bid must be non-negative")
    .optional(),
  title: z.string().nonempty("Title is required").optional(),
});
export type UpdateGigRequestDTO = z.infer<typeof UpdateGigRequestSchema>;

// Delete Gig Request
export const DeleteGigRequestSchema = z.object({
  id: z.string().nonempty("Gig ID is required"),
});
export type DeleteGigRequestDTO = z.infer<typeof DeleteGigRequestSchema>;
