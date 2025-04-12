import { NextFunction, Request, Response } from "express";
import { AuthService } from "../../services/implementations/auth.service";
import { StatusCode } from "../../enums/status-code.enum";
import {
  ForgotPasswordRequestSchema,
  RefreshTokenRequestSchema,
  RegisterInstructorRequestSchema,
  ResendOtpRequestSchema,
  ResetPasswordRequestSchema,
  SignInRequestSchema,
  SignOutRequestSchema,
  SignUpRequestSchema,
  VerifyOtpRequestSchema,
  VerifyResetOtpRequestSchema,
} from "../dtos/auth/request.dto";
import {
  ForgotPasswordResponseSchema,
  RefreshTokenResponseSchema,
  RegisterInstructorResponseSchema,
  ResendOtpResponseSchema,
  ResetPasswordResponseSchema,
  SignInResponseSchema,
  SignOutResponseSchema,
  SignUpResponseSchema,
  VerifyOtpResponseSchema,
  VerifyResetOtpResponseSchema,
} from "../dtos/auth/response.dto";
import { IAuthController } from "../interfaces/auth-controller.interface";

export class AuthController implements IAuthController {
  constructor(private authService: AuthService) {}

  // Sign Up and OTP Verification
  async signUp(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = SignUpRequestSchema.parse(req.body);
      const user = await this.authService.signUp(data);
      const response = SignUpResponseSchema.parse({
        status: "success",
        code: StatusCode.CREATED,
        message: "User signed up successfully, OTP sent",
        data: user,
      });
      res.status(response.code).json(response);
    } catch (error) {
      next(error);
    }
  }

  async verifyOtp(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = VerifyOtpRequestSchema.parse(req.body);
      const user = await this.authService.saveUser(data);
      const response = VerifyOtpResponseSchema.parse({
        status: "success",
        code: StatusCode.OK, // 200 since it's a verification, not creation
        message: "OTP verified successfully",
        data: user,
      });
      res.status(response.code).json(response);
    } catch (error) {
      next(error);
    }
  }

  async resendOtp(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = ResendOtpRequestSchema.parse(req.body);
      const user = await this.authService.sendOtp(data);
      const response = ResendOtpResponseSchema.parse({
        status: "success",
        code: StatusCode.OK,
        message: "OTP resent successfully",
        data: user,
      });
      res.status(response.code).json(response);
    } catch (error) {
      next(error);
    }
  }

  // Password Reset Flow
  async forgotPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = ForgotPasswordRequestSchema.parse(req.body);
      const result = await this.authService.forgotUserPassword(data);
      const response = ForgotPasswordResponseSchema.parse({
        status: "success",
        code: StatusCode.OK,
        message: "Password reset OTP sent",
        data: result,
      });
      res.status(response.code).json(response);
    } catch (error) {
      next(error);
    }
  }

  async verifyResetOtp(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = VerifyResetOtpRequestSchema.parse(req.body);
      const result = await this.authService.verifyResetOtp(data);
      const response = VerifyResetOtpResponseSchema.parse({
        status: "success",
        code: StatusCode.OK,
        message: "Reset OTP verified successfully",
        data: result,
      });
      res.status(response.code).json(response);
    } catch (error) {
      next(error);
    }
  }

  async resetPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = ResetPasswordRequestSchema.parse(req.body);
      const result = await this.authService.resetPassword(data);
      const response = ResetPasswordResponseSchema.parse({
        status: "success",
        code: StatusCode.OK,
        message: "Password reset successfully",
        data: result,
      });
      res.status(response.code).json(response); // Fixed typo: "resonse" -> "response"
    } catch (error) {
      next(error);
    }
  }

  // Token Refresh
  async refreshToken(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const refreshToken = RefreshTokenRequestSchema.parse(req.cookies);
      const result = await this.authService.refreshToken(refreshToken);
      const response = RefreshTokenResponseSchema.parse({
        status: "success",
        code: StatusCode.OK, // 200 since it's a refresh, not a new creation
        message: "Token refreshed successfully",
        data: result,
      });
      res.cookie("refreshToken", result.refreshToken, {
        httpOnly: true,
        sameSite: "strict",
        secure: true,
        maxAge: 24 * 60 * 60 * 1000,
      });
      res.status(response.code).json(response);
    } catch (error) {
      next(error);
    }
  }

  async signIn(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = SignInRequestSchema.parse(req.body);
      const result = await this.authService.signIn(data);
      const response = SignInResponseSchema.parse({
        status: "success",
        code: StatusCode.OK,
        message: "Signed in successfully",
        data: result,
      });
      res.cookie("refreshToken", result.refreshToken, {
        httpOnly: true,
        sameSite: "strict",
        secure: true,
        maxAge: 24 * 60 * 60 * 1000,
      });
      res.status(response.code).json(response);
    } catch (error) {
      next(error);
    }
  }

  async signOut(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = SignOutRequestSchema.parse(req.cookies);
      const result = await this.authService.signOut(data);
      const response = SignOutResponseSchema.parse({
        status: "success",
        code: StatusCode.OK, // 200 since it's a logout, not creation
        message: "Signed out successfully",
        data: null,
      });
      res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
      });
      res.status(response.code).json(response);
    } catch (error) {
      next(error);
    }
  }

  // Instructor Registration
  async registerInstructor(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = RegisterInstructorRequestSchema.parse(req.body);
      const currentUser = req.verifiedUser!;
      const result = await this.authService.registerInstructor(data, currentUser);
      const response = RegisterInstructorResponseSchema.parse({
        status: "success",
        code: StatusCode.OK,
        message: "Instructor registered successfully",
        data: result,
      });
      res.status(response.code).json(response); // Changed .send to .json for consistency
    } catch (error) {
      next(error);
    }
  }
}