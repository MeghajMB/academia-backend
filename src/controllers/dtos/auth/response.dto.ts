import { z } from "zod";

// Sign Up Response
export const SignUpResponseSchema = z.object({
  message: z.string(),
});
export type SignUpResponseDTO = z.infer<typeof SignUpResponseSchema>;

// Verify OTP Response
export const VerifyOtpResponseSchema = z.object({
  message: z.string(),
});
export type VerifyOtpResponseDTO = z.infer<typeof VerifyOtpResponseSchema>;

// Resend OTP Response
export const ResendOtpResponseSchema = z.object({
  message: z.string(),
});
export type ResendOtpResponseDTO = z.infer<typeof ResendOtpResponseSchema>;

// Forgot Password Response
export const ForgotPasswordResponseSchema = z.object({
  message: z.string(),
});
export type ForgotPasswordResponseDTO = z.infer<
  typeof ForgotPasswordResponseSchema
>;

// Verify Reset OTP Response
export const VerifyResetOtpResponseSchema = z.object({
  resetToken: z.string(),
});
export type VerifyResetOtpResponseDTO = z.infer<
  typeof VerifyResetOtpResponseSchema
>;

// Reset Password Response
export const ResetPasswordResponseSchema = z.object({
  message: z.string(),
});
export type ResetPasswordResponseDTO = z.infer<
  typeof ResetPasswordResponseSchema
>;

// Refresh Token Response
export const RefreshTokenResponseSchema = z.object({
  accessToken: z.string(),
  id: z.string(),
  role: z.string(),
  name: z.string(),
  email: z.string(),
  verified: z.string(),
  goldCoin: z.number(),
  profilePicture: z.string(),
});
export type RefreshTokenResponseDTO = z.infer<
  typeof RefreshTokenResponseSchema
>;

// Sign In Response
export const SignInResponseSchema = z.object({
  accessToken: z.string(),
  name: z.string(),
  role: z.string(),
  id: z.string(),
  userEmail: z.string(),
});
export type SignInResponseDTO = z.infer<typeof SignInResponseSchema>;

// Sign Out Response
export const SignOutResponseSchema = z.object({
  message: z.string(),
});
export type SignOutResponseDTO = z.infer<typeof SignOutResponseSchema>;

// Register Instructor Response
export const RegisterInstructorResponseSchema = z.object({
  message: z.string(),
});
export type RegisterInstructorResponseDTO = z.infer<
  typeof RegisterInstructorResponseSchema
>;
