import { z } from "zod";

const SuccessResponseSchema = z.object({
  status: z.literal("success"),
  code: z.number(),
  message: z.string(),
  data: z.any(),
});

// Place Bid Response
export const PlaceBidResponseSchema = SuccessResponseSchema.extend({
  message: z.literal("success"),
  data: z.null(), // Assuming no data returned, just a success message
});
export type PlaceBidResponseDTO = z.infer<typeof PlaceBidResponseSchema>;

// Get Bid By ID Response
export const GetBidByIdResponseSchema = SuccessResponseSchema.extend({
  data: z.object({
    id: z.string(),
    gigId: z.string(),
    userId: z.string(),
    bidAmt: z.number(),
    createdAt: z.string().optional(), // Assuming ISO date string or similar
  }),
});
export type GetBidByIdResponseDTO = z.infer<typeof GetBidByIdResponseSchema>;

// Get Bids For Gig Response
export const GetBidsForGigResponseSchema = SuccessResponseSchema.extend({
  data: z.array(
    z.object({
      id: z.string(),
      gigId: z.string(),
      userId: z.string(),
      bidAmt: z.number(),
      createdAt: z.string().optional(),
    })
  ),
});
export type GetBidsForGigResponseDTO = z.infer<
  typeof GetBidsForGigResponseSchema
>;
