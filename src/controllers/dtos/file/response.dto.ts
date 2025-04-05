import { z } from "zod";

const SuccessResponseSchema = z.object({
  status: z.literal("success"),
  code: z.number(),
  message: z.string(),
  data: z.any(),
});

// Generate Get Signed URL Response
export const GenerateGetSignedUrlResponseSchema = SuccessResponseSchema.extend({
  data: z.object({
    url: z.string(), // Signed URL for GET
  }),
});
export type GenerateGetSignedUrlResponseDTO = z.infer<
  typeof GenerateGetSignedUrlResponseSchema
>;

// Generate Put Signed URL Response
export const GeneratePutSignedUrlResponseSchema = SuccessResponseSchema.extend({
  data: z.object({
    url: z.string(), // Signed URL for PUT
  }),
});
export type GeneratePutSignedUrlResponseDTO = z.infer<
  typeof GeneratePutSignedUrlResponseSchema
>;
