import { z } from "zod";

// Generate Get Signed URL Request
export const GenerateGetSignedUrlRequestSchema = z.object({
  key: z.string().nonempty("Key is required"),
});
export type GenerateGetSignedUrlRequestDTO = z.infer<
  typeof GenerateGetSignedUrlRequestSchema
>;

// Generate Put Signed URL Request
export const GeneratePutSignedUrlRequestSchema = z.object({
  key: z.string().nonempty("Key is required"),
  contentType: z.string().nonempty("Content type is required"),
  isPublic: z.boolean().optional(), // Optional boolean flag
  isTemp: z.boolean().optional(), // Optional boolean flag
});
export type GeneratePutSignedUrlRequestDTO = z.infer<
  typeof GeneratePutSignedUrlRequestSchema
>;
