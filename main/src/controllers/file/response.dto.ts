import { z } from "zod";
import { SuccessResponseSchema } from "../shared-response.dto";

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
