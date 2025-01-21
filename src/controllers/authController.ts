// src/interfaces/controllers/AuthController.ts
import { NextFunction, Request, Response } from "express";
import { AuthService } from "../services/authService";
import { AppError } from "../errors/app-error";
import { StatusCode } from "../enums/statusCode.enum";

export class AuthController {
  constructor(private authService: AuthService) {}
  //Otp Verifcation
  async signUp(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    const { name, email, password } = req.body;

    try {
      const user = await this.authService.signUp({ name, email, password });
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
      
      const user = await this.authService.verifyOtp(otp, email);
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
      const {email } = req.body;
      
      const user = await this.authService.resendOtp(email);
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
        throw new AppError("Unauthorized",406)
      }
      res.cookie("refreshToken", data.refreshToken, {
        httpOnly: true,
        sameSite: "strict",
        secure: true,
        maxAge: 24 * 60 * 60 * 1000,
      });  
      res
        .status(201)
        .json({
          accessToken: data.accessToken,
          id: data.id,
          name: data.name,
          role: data.role,
          verified:data.verified
        });
    } catch (error) {
      next(error);
    }
  }
  //Login
  async signIn(req: Request, res: Response, next: NextFunction): Promise<void> {
    const { email, password } = req.body;

    try {
      const { accessToken, refreshToken, name, role, id,userEmail } = await this.authService.signIn(email, password);

      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        sameSite: "strict",
        secure: true,
        maxAge: 24 * 60 * 60 * 1000,
      });
      res.status(201).json({ accessToken, name, role, id,userEmail });
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
      const user = await this.authService.signOut(refreshToken);
      res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: true, // Only for HTTPS
        sameSite: 'strict',
      });
      res.status(201).json({ message: "Success" });
    } catch (error) {
      next(error);
    }
  }
  async registerInstructor(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const {instructorData}=req.body;
      const currentUser=req.verifiedUser
      const user=await this.authService.registerInstructor(instructorData,currentUser!);
      res.status(StatusCode.OK).send({message:'Success'})
    } catch (error) {
      next(error)
    }
  }
}
