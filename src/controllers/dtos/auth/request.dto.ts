import { z } from "zod";

// Sign Up
export const SignUpRequestSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
  email: z.string().email({ message: "Invalid email format" }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters long" })
    .regex(/[A-Z]/, {
      message: "Password must contain at least one uppercase letter",
    })
    .regex(/[a-z]/, {
      message: "Password must contain at least one lowercase letter",
    })
    .regex(/[0-9]/, { message: "Password must contain at least one number" })
    .regex(/[\W_]/, {
      message: "Password must contain at least one special character",
    }),
});
export type SignUpRequestDTO = z.infer<typeof SignUpRequestSchema>;

// Verify OTP
export const VerifyOtpRequestSchema = z.object({
  email: z.string().email({ message: "Invalid email format" }),
  otp: z.string().min(4, { message: "OTP is required" }),
});
export type VerifyOtpRequestDTO = z.infer<typeof VerifyOtpRequestSchema>;

// Resend OTP
export const ResendOtpRequestSchema = z.object({
  email: z.string().email({ message: "Invalid email format" }),
});
export type ResendOtpRequestDTO = z.infer<typeof ResendOtpRequestSchema>;

// Forgot Password
export const ForgotPasswordRequestSchema = z.object({
  email: z.string().email({ message: "Invalid email format" }),
});
export type ForgotPasswordRequestDTO = z.infer<
  typeof ForgotPasswordRequestSchema
>;

// Verify Reset OTP
export const VerifyResetOtpRequestSchema = z.object({
  email: z.string().email({ message: "Invalid email format" }),
  otp: z.string().min(4, { message: "OTP is required" }),
});
export type VerifyResetOtpRequestDTO = z.infer<
  typeof VerifyResetOtpRequestSchema
>;

// Reset Password
export const ResetPasswordRequestSchema = z.object({
  email: z.string().email({ message: "Invalid email format" }),
  token: z.string(),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters long" })
    .regex(/[A-Z]/, {
      message: "Password must contain at least one uppercase letter",
    })
    .regex(/[a-z]/, {
      message: "Password must contain at least one lowercase letter",
    })
    .regex(/[0-9]/, { message: "Password must contain at least one number" })
    .regex(/[\W_]/, {
      message: "Password must contain at least one special character",
    }),
});
export type ResetPasswordRequestDTO = z.infer<
  typeof ResetPasswordRequestSchema
>;

// Refresh Token
export const RefreshTokenRequestSchema = z.object({
  refreshToken: z.string().min(1, { message: "Refresh token is required" }),
});
export type RefreshTokenRequestDTO = z.infer<typeof RefreshTokenRequestSchema>;

// Sign In
export const SignInRequestSchema = z.object({
  email: z.string({ message: "Email is required" }),
  password: z.string({ message: "Password is required" }),
});
export type SignInRequestDTO = z.infer<typeof SignInRequestSchema>;
// Sign Out
export const SignOutRequestSchema = z.object({
  refreshToken: z.string().min(1, { message: "Refresh token is required" }),
});
export type SignOutRequestDTO = z.infer<typeof SignOutRequestSchema>;

// Register Instructor
export const RegisterInstructorRequestSchema = z.object({
  headline: z
    .string()
    .min(5, { message: "Headline must be at least 5 characters long" }),
  biography: z
    .string()
    .min(100, { message: "Biography must be at least 100 characters long" }),
  facebook: z.string().url({ message: "Please enter a valid Facebook URL" }),
  linkedin: z.string().url({ message: "Please enter a valid LinkedIn URL" }),
  twitter: z.string().url({ message: "Please enter a valid Twitter URL" }),
  website: z.string().url({ message: "Please enter a valid Website URL" }),
  agreement: z.boolean().refine((val) => val === true, {
    message: "You must agree to the terms and policies",
  }),
});
export type RegisterInstructorRequestDTO = z.infer<
  typeof RegisterInstructorRequestSchema
>;
