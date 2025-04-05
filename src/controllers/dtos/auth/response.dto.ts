// src/dtos/auth/response.dto.ts
import { z } from "zod";

const SuccessResponseSchema = z.object({
  status: z.literal("success"),
  code: z.number(),
  message: z.string(),
  data: z.any(),
});

// Sign Up Response
export const SignUpResponseSchema = SuccessResponseSchema.extend({
  data: z.object({
    userId: z.string(), // Assuming signUp returns this
  }),
});
export type SignUpResponseDTO = z.infer<typeof SignUpResponseSchema>;

// Verify OTP Response
export const VerifyOtpResponseSchema = SuccessResponseSchema.extend({
  data: z.object({
    userId: z.string(), // Assuming saveUser returns this
  }),
});
export type VerifyOtpResponseDTO = z.infer<typeof VerifyOtpResponseSchema>;

// Resend OTP Response
export const ResendOtpResponseSchema = SuccessResponseSchema.extend({
  data: z.null(), // No significant data returned
});
export type ResendOtpResponseDTO = z.infer<typeof ResendOtpResponseSchema>;

// Forgot Password Response
export const ForgotPasswordResponseSchema = SuccessResponseSchema.extend({
  data: z.null(),
});
export type ForgotPasswordResponseDTO = z.infer<
  typeof ForgotPasswordResponseSchema
>;

// Verify Reset OTP Response
export const VerifyResetOtpResponseSchema = SuccessResponseSchema.extend({
  data: z.object({
    resetToken: z.string(),
  }),
});
export type VerifyResetOtpResponseDTO = z.infer<
  typeof VerifyResetOtpResponseSchema
>;

// Reset Password Response
export const ResetPasswordResponseSchema = SuccessResponseSchema.extend({
  data: z.null(),
});
export type ResetPasswordResponseDTO = z.infer<
  typeof ResetPasswordResponseSchema
>;

// Refresh Token Response
export const RefreshTokenResponseSchema = SuccessResponseSchema.extend({
  data: z.object({
    accessToken: z.string(),
    refreshToken: z.string(),
    id: z.coerce.string(),
    role: z.string(),
    name: z.string(),
    email: z.string(),
    verified: z.boolean(),
    goldCoin: z.number(),
    profilePicture: z.string(),
  }),
});
export type RefreshTokenResponseDTO = z.infer<
  typeof RefreshTokenResponseSchema
>;

// Sign In Response
export const SignInResponseSchema = SuccessResponseSchema.extend({
  data: z.object({
    accessToken: z.string(),
    refreshToken: z.string(),
    id: z.string(),
    name: z.string(),
    role: z.string(),
    userEmail: z.string(),
  }),
});
export type SignInResponseDTO = z.infer<typeof SignInResponseSchema>;

// Sign Out Response
export const SignOutResponseSchema = SuccessResponseSchema.extend({
  data: z.null(),
});
export type SignOutResponseDTO = z.infer<typeof SignOutResponseSchema>;

// Register Instructor Response
export const RegisterInstructorResponseSchema = SuccessResponseSchema.extend({
  data: z.null(),
});
export type RegisterInstructorResponseDTO = z.infer<
  typeof RegisterInstructorResponseSchema
>;
