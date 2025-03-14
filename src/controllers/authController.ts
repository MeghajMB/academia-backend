// src/interfaces/controllers/AuthController.ts
import { NextFunction, Request, Response } from "express";
import { AuthService } from "../services/authService";
import { AppError } from "../errors/app-error";
import { StatusCode } from "../enums/statusCode.enum";

import validator from "validator";
import { RequestValidationError } from "../errors/request-validaion-error";
import { BadRequestError } from "../errors/bad-request-error";

export class AuthController {
  constructor(private authService: AuthService) {}
  //Otp Verifcation
  async signUp(req: Request, res: Response, next: NextFunction): Promise<void> {
    const { name, email, password } = req.body;

    try {
      if (!name || !email || !password) {
        throw new RequestValidationError([
          { message: "All fields are required." },
        ]);
      }

      if (!validator.isEmail(email)) {
        throw new RequestValidationError([
          { message: "Invalid email format.", field: "email" },
        ]);
      }

      if (!validator.isLength(password, { min: 6 })) {
        throw new RequestValidationError([
          {
            message: "Password must be at least 6 characters long.",
            field: "password",
          },
        ]);
      }
      const user = await this.authService.signUp(name, email, password);
      res.status(201).json({ message: "OTP send successfully" });
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
      const { otp, email } = req.body;
      if (!otp || !email) {
        throw new AppError("Enter Otp", 400);
      }
      const user = await this.authService.saveUser(otp, email);
      res.status(201).json(user);
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
      const { email } = req.body;
      if(!email){
        throw new BadRequestError("Must Provide Email")
      }
      const user = await this.authService.sendOtp(email);
      res.status(StatusCode.OK).json({ message: "OTP send successfully" });
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
      const { email } = req.body;
      if(!email){
        throw new BadRequestError("Must Provide Email")
      }
      const user = await this.authService.forgotUserPassword(email);
      res.status(StatusCode.OK).json({ message: "OTP send successfully" });
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
      const { email,otp } = req.body;
      if(!email || otp){
        throw new BadRequestError("Must Provide Email and Otp")
      }
      const resetToken = await this.authService.verifyResetOtp(email,otp);
      res.status(StatusCode.OK).json(resetToken);
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
      const { data,token } = req.body;
      if(!data || token){
        throw new BadRequestError("Must Provide Email and Otp")
      }
      const user = await this.authService.resetPassword(data,token);
      res.status(StatusCode.OK).json({ message: "OTP send successfully" });
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
      const refreshToken = req.cookies.refreshToken;
      if (!refreshToken) throw new AppError("No Token", 401);

      const data = await this.authService.refreshToken(refreshToken);
      if (!data) {
        throw new AppError("Unauthorized", 406);
      }
      res.cookie("refreshToken", data.refreshToken, {
        httpOnly: true,
        sameSite: "strict",
        secure: true,
        maxAge: 24 * 60 * 60 * 1000,
      });
      res.status(201).json(data);
    } catch (error) {
      next(error);
    }
  }
  //Login
  async signIn(req: Request, res: Response, next: NextFunction): Promise<void> {
    const { email, password } = req.body;

    try {
      if(!email || !password){
        throw new BadRequestError("Must provide email and password")
      }
      const { accessToken, refreshToken, name, role, id, userEmail } =
        await this.authService.signIn(email, password);

      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        sameSite: "strict",
        secure: true,
        maxAge: 24 * 60 * 60 * 1000,
      });
      res.status(201).json({ accessToken, name, role, id, userEmail });
    } catch (error) {
      next(error);
    }
  }
  async signOut(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    const refreshToken = req.cookies.refreshToken;

    try {
      if(!refreshToken){
        throw new BadRequestError("No refresh token")
      }
      const user = await this.authService.signOut(refreshToken);
      res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: true, // Only for HTTPS
        sameSite: "strict",
      });
      res.status(201).json({ message: "Success" });
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
      const { instructorData } = req.body;
      const validateInstructorData = (data: {
        headline: string;
        biography: string;
        facebook: string;
        linkedin: string;
        twitter: string;
        website: string;
        agreement: boolean;
      }) => {
        const errors: { message: string; field?: string }[] = [];
  
        if (validator.isEmpty(data.headline || "")) {
          errors.push({
            message: "Professional headline is required.",
            field: "headline",
          });
        } else if (!validator.isLength(data.headline, { min: 5 })) {
          errors.push({
            message: "Headline must be at least 5 characters long.",
            field: "headline",
          });
        }
  
        if (validator.isEmpty(data.biography || "")) {
          errors.push({
            message: "Professional biography is required.",
            field: "biography",
          });
        } else if (!validator.isLength(data.biography, { min: 100 })) {
          errors.push({
            message: "Biography must be at least 100 characters long.",
            field: "biography",
          });
        }
  
        if (!validator.isURL(data.website)) {
          errors.push({
            message: "Please enter a valid website URL.",
            field: "website",
          });
        }
        if (!validator.isURL(data.facebook)) {
          errors.push({
            message: "Please enter a valid Facebook URL.",
            field: "facebook",
          });
        }
        if (!validator.isURL(data.linkedin)) {
          errors.push({
            message: "Please enter a valid LinkedIn URL.",
            field: "linkedin",
          });
        }
        if (!validator.isURL(data.twitter)) {
          errors.push({
            message: "Please enter a valid Twitter URL.",
            field: "twitter",
          });
        }
  
        if (!data.agreement) {
          errors.push({
            message: "You must agree to the terms and policies.",
            field: "agreement",
          });
        }
  
        return errors;
      };
      
      const validationErrors = validateInstructorData(instructorData);
      if (validationErrors.length > 0) {
        throw new AppError(
          "Validation Error",
          StatusCode.BAD_REQUEST,
          validationErrors
        );
      }
      const currentUser = req.verifiedUser;
      const user = await this.authService.registerInstructor(
        instructorData,
        currentUser!
      );
      res.status(StatusCode.OK).send({ message: "Success" });
    } catch (error) {
      next(error);
    }
  }
}
