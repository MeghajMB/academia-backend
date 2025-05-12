import { z } from "zod";

// Place Bid Request
export const PlaceBidRequestSchema = z.object({
  gigId: z.string().nonempty("Gig ID is required"),
  bidAmt: z.coerce.number().min(0, "Bid amount must be non-negative"),
});
export type PlaceBidRequestDTO = z.infer<typeof PlaceBidRequestSchema>;

// Get Bid By ID Request
export const GetBidByIdRequestSchema = z.object({
  bidId: z.string().nonempty("Bid ID is required"),
});
export type GetBidByIdRequestDTO = z.infer<typeof GetBidByIdRequestSchema>;

// Get Bids For Gig Request
export const GetBidsForGigRequestSchema = z.object({
  gigId: z.string().nonempty("Gig ID is required"),
});
export type GetBidsForGigRequestDTO = z.infer<
  typeof GetBidsForGigRequestSchema
>;