import { z } from "zod";

export const PutUserProfileRequestSchemaRequestSchema = z.object({
  userId: z.string(),
  imageUrl: z.string(),
  headLine: z.string(),
  name: z.number(),
});
export type PutUserProfileRequestSchemaRequestDTO = z.infer<
  typeof PutUserProfileRequestSchemaRequestSchema
>;
