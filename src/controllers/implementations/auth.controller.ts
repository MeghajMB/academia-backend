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

export class AuthController {
  constructor(private authService: AuthService) {}
  //Otp Verifcation
  async signUp(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = SignUpRequestSchema.parse(req.body);
      const user = await this.authService.signUp(data);
      const response = SignUpResponseSchema.parse(user);
      res.status(StatusCode.CREATED).json(response);
    } catch (error) {
      next(error);
    }
  }
  async verifyOtp(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const data = VerifyOtpRequestSchema.parse(req.body);
      const user = await this.authService.saveUser(data);
      const response = VerifyOtpResponseSchema.parse(user);
      res.status(StatusCode.CREATED).json(response);
    } catch (error) {
      next(error);
    }
  }
  async resendOtp(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const data = ResendOtpRequestSchema.parse(req.body);
      const user = await this.authService.sendOtp(data);
      const response = ResendOtpResponseSchema.parse(user);
      res.status(StatusCode.OK).json(response);
    } catch (error) {
      next(error);
    }
  }
  async forgotPassword(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const data = ForgotPasswordRequestSchema.parse(req.body);
      const user = await this.authService.forgotUserPassword(data);
      const response = ForgotPasswordResponseSchema.parse(user);
      res.status(StatusCode.OK).json(response);
    } catch (error) {
      next(error);
    }
  }
  async verifyResetOtp(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const data = VerifyResetOtpRequestSchema.parse(req.body);
      const result = await this.authService.verifyResetOtp(data);
      const response = VerifyResetOtpResponseSchema.parse(result);
      res.status(StatusCode.OK).json(response);
    } catch (error) {
      next(error);
    }
  }
  async resetPassword(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const data = ResetPasswordRequestSchema.parse(req.body);
      const result = await this.authService.resetPassword(data);
      const resonse = ResetPasswordResponseSchema.parse(result);
      res.status(StatusCode.OK).json(resonse);
    } catch (error) {
      next(error);
    }
  }
  //refreshToken
  async refreshToken(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const refreshToken = RefreshTokenRequestSchema.parse(req.cookies);
      const result = await this.authService.refreshToken(refreshToken);
      const response = RefreshTokenResponseSchema.parse(result);
      res.cookie("refreshToken", result.refreshToken, {
        httpOnly: true,
        sameSite: "strict",
        secure: true,
        maxAge: 24 * 60 * 60 * 1000,
      });
      res.status(StatusCode.CREATED).json(response);
    } catch (error) {
      next(error);
    }
  }
  //Login
  async signIn(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = SignInRequestSchema.parse(req.body);
      const result = await this.authService.signIn(data);
      const response = SignInResponseSchema.parse(result);
      res.cookie("refreshToken", result.refreshToken, {
        httpOnly: true,
        sameSite: "strict",
        secure: true,
        maxAge: 24 * 60 * 60 * 1000,
      });
      res.status(StatusCode.CREATED).json(response);
    } catch (error) {
      next(error);
    }
  }
  async signOut(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const data = SignOutRequestSchema.parse(req.cookies);
      const result = await this.authService.signOut(data);
      const response = SignOutResponseSchema.parse(result);
      res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: true, // Only for HTTPS
        sameSite: "strict",
      });
      res.status(StatusCode.CREATED).json(response);
    } catch (error) {
      next(error);
    }
  }
  async registerInstructor(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const data = RegisterInstructorRequestSchema.parse(req.body);
      const currentUser = req.verifiedUser!;
      const result = await this.authService.registerInstructor(
        data,
        currentUser
      );
      const response = RegisterInstructorResponseSchema.parse(result);
      res.status(StatusCode.OK).send(response);
    } catch (error) {
      next(error);
    }
  }
}
