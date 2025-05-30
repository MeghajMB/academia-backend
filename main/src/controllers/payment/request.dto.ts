import { z } from "zod";

// Add Review Request
export const GetTransactionHistoryRequestSchema = z.object({
  limit: z.number(),
  page: z.coerce.number().int().transform((val) => (val < 1 ? 1 : val)).default(1),
  type: z.enum(["credit", "debit","all"]),
  purchaseType: z.enum(["course", "conversion", "coins","all"]),
  userId: z.string(),
});
export type GetTransactionHistoryRequesttDTO = z.infer<
  typeof GetTransactionHistoryRequestSchema
>;
