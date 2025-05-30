import { IUserRepository } from "../../repositories/user/user.interface";
import { redis } from "../../lib/redis";
import { ExistingUserError } from "../../util/errors/existing-user-error";
import { AppError } from "../../util/errors/app-error";
import bcrypt from "bcryptjs";
import { authenticator } from "otplib";
import jwt, { JsonWebTokenError, JwtPayload } from "jsonwebtoken";
import { BadRequestError } from "../../util/errors/bad-request-error";
import { StatusCode } from "../../enums/status-code.enum";
import { NotFoundError } from "../../util/errors/not-found-error";
import { IAuthService } from "./auth.interface";
import { transporter } from "../../lib/emailClient";
import {
  CurrentUser,
  ForgotUserPasswordParams,
  ForgotUserPasswordResponse,
  RefreshTokenParams,
  RefreshTokenResponse,
  RegisterInstructorParams,
  RegisterInstructorResponse,
  ResetPasswordParams,
  ResetPasswordResponse,
  SaveUserParams,
  SaveUserResponse,
  SendOtpParams,
  SendOtpResponse,
  SignInParams,
  SignInResponse,
  SignOutParams,
  SignOutResponse,
  SignUpParams,
  SignUpResponse,
  VerifyResetOtpParams,
  VerifyResetOtpResponse,
} from "./auth.types";
import { IWalletRepository } from "../../repositories/wallet/wallet.interface";
import mongoose from "mongoose";
import { inject, injectable } from "inversify";
import { Types } from "../../container/types";

@injectable()
export class AuthService implements IAuthService {
  constructor(
    @inject(Types.userRepository)
    private readonly userRepository: IUserRepository,
    @inject(Types.WalletRepository)
    private readonly walletRepository: IWalletRepository
  ) {}

  async refreshToken({
    refreshToken,
  }: RefreshTokenParams): Promise<RefreshTokenResponse> {
    try {
      const payload = jwt.verify(
        refreshToken,
        process.env.JWT_REFRESH_TOKEN_SECRET!
      ) as null | JwtPayload;

      if (!payload) {
        throw new BadRequestError("Must have refresh token");
      }
      const userExists = await redis.get(`refreshToken:${payload.id}`);
      if (!userExists) {
        throw new BadRequestError("No user");
      }
      const user = await this.userRepository.findById(payload.id);
      if (!user || user.isBlocked) {
        throw new BadRequestError("You have been blocked");
      }

      const accessToken = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        process.env.JWT_ACCESS_TOKEN_SECRET!,
        { expiresIn: "15m" }
      );

      return {
        accessToken,
        refreshToken,
        id: user.id,
        role: user.role,
        name: user.name,
        email: user.email,
        verified: user.verified,
        profilePicture: user.profilePicture,
      };
    } catch (error) {
      if (error instanceof JsonWebTokenError) {
        throw new BadRequestError("Token has expired");
      }
      throw error;
    }
  }
  async signUp({
    name,
    email,
    password,
  }: SignUpParams): Promise<SignUpResponse> {
    const existingUser = await this.userRepository.findByEmail(email);

    if (existingUser) {
      throw new ExistingUserError();
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const secret = authenticator.generateSecret();
    const token = authenticator.generate(secret);

    const tempUser = { name, email, password: hashedPassword };
    console.log("The otp is ", token);
    // sending email

    const mailOptions = {
      from: `info@demomailtrap.com`,
      to: email,
      subject: "Verification Code",
      text: `Your Verification Code is ${token}`,
      html: `<b>Your Verification Code is ${token}</b>`,
    };

    try {
      // Send email using transporter
      await transporter.sendMail(mailOptions);
      console.log("Email sent successfully.");
    } catch (error) {
      console.log(error);
      throw new AppError(
        "Failed to send email.",
        StatusCode.INTERNAL_SERVER_ERROR,
        [
          {
            message:
              "Unable to send verification email. Please try again later.",
          },
        ]
      );
    }
    await redis.setex(`tempUser:${email}`, 300, JSON.stringify(tempUser));
    await redis.set(`otp:${email}`, token, "EX", 69);
    return { message: "OTP send successfully" };
  }

  async saveUser({ email, otp }: SaveUserParams): Promise<SaveUserResponse> {
    const data = await redis.get(`tempUser:${email}`);
    const storedOtp = await redis.get(`otp:${email}`);

    if (!data) {
      throw new AppError("SignIn Again", StatusCode.NOT_FOUND);
    }
    if (!storedOtp) {
      throw new AppError("Resend Otp", 410);
    }
    if (storedOtp !== otp) {
      throw new AppError("Incorrect OTP", 404);
    }
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const tempUser = (await JSON.parse(data)) as {
        name: string;
        email: string;
        password: string;
      };

      const user = await this.userRepository.createUserWithSession(
        tempUser,
        session
      );
      const wallet = await this.walletRepository.createWallet(
        user._id,
        session
      );
      await redis.del(`tempUser:${email}`);
      await session.commitTransaction();
      return { message: "User Created Successfully" };
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  async sendOtp({ email }: SendOtpParams): Promise<SendOtpResponse> {
    const secret = authenticator.generateSecret();
    const token = authenticator.generate(secret);

    console.log("The otp is ", token);
    // sending email

    const mailOptions = {
      from: `info@demomailtrap.com`,
      to: email,
      subject: "Verification Code",
      text: `Your Verification Code is ${token}`,
      html: `<b>Your Verification Code is ${token}</b>`,
    };

    try {
      // Send email using transporter
      await transporter.sendMail(mailOptions);
      console.log("Email sent successfully.");
    } catch (error) {
      console.log(error);
      throw new AppError(
        "Failed to send email.",
        StatusCode.INTERNAL_SERVER_ERROR,
        [
          {
            message:
              "Unable to send verification email. Please try again later.",
          },
        ]
      );
    }
    await redis.set(`otp:${email}`, token, "EX", 69);
    return { message: "OTP send successfully" };
  }

  async forgotUserPassword({
    email,
  }: ForgotUserPasswordParams): Promise<ForgotUserPasswordResponse> {
    const existingUser = await this.userRepository.findByEmail(email);
    if (!existingUser) {
      throw new AppError(
        "You Dont have an account with us",
        StatusCode.NOT_FOUND
      );
    }
    if (!existingUser.password) {
      throw new BadRequestError("You are signed in using google");
    }
    const sendOtp = await this.sendOtp({ email });
    return { message: "OTP send successfully" };
  }

  async verifyResetOtp({
    email,
    otp,
  }: VerifyResetOtpParams): Promise<VerifyResetOtpResponse> {
    const redisKey = `otp:${email}`;
    const storedOtp = await redis.get(redisKey);

    if (!storedOtp || storedOtp !== otp) {
      throw new Error("Invalid or expired OTP");
    }

    // Delete the OTP after successful verification
    await redis.del(redisKey);

    // Generate reset token

    const resetToken = jwt.sign(
      { email, purpose: "password-reset" },
      process.env.JWT_PASSWORD_RESET_SECRET!,
      { expiresIn: "5m" }
    );

    // Store reset token in Redis with 5 minutes expiry
    const resetTokenKey = `pwd_reset_token:${email}`;
    await redis.set(resetTokenKey, resetToken, "EX", 300);

    return { resetToken };
  }

  async resetPassword({
    email,
    password,
    token,
  }: ResetPasswordParams): Promise<ResetPasswordResponse> {
    // Verify token
    const decoded = jwt.verify(
      token,
      process.env.JWT_PASSWORD_RESET_SECRET!
    ) as { email: string };

    if (decoded.email !== email) {
      throw new BadRequestError("Invalid reset token");
    }

    // Check if token exists in Redis
    const resetTokenKey = `pwd_reset_token:${email}`;
    const storedToken = await redis.get(resetTokenKey);

    if (!storedToken || storedToken !== token) {
      throw new BadRequestError("Invalid or expired reset token");
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 10);

    const existingUser = await this.userRepository.findByEmail(email);
    if (!existingUser) {
      throw new AppError("No user found", StatusCode.NOT_FOUND);
    }
    await this.userRepository.update(
      existingUser.id,
      { password: hashedPassword },
      {}
    );
    // Delete reset token from Redis
    await redis.del(resetTokenKey);
    return { message: "OTP send successfully" };
  }

  async signIn(payload: SignInParams): Promise<SignInResponse> {
    const user = await this.userRepository.findByEmail(payload.email);

    if (!user)
      throw new AppError("Invalid Email or password", StatusCode.UNAUTHORIZED);

    const isPasswordValid = await bcrypt.compare(
      payload.password,
      user.password
    );

    if (!isPasswordValid)
      throw new AppError("Invalid Email or password", StatusCode.UNAUTHORIZED);

    const accessToken = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_ACCESS_TOKEN_SECRET!,
      { expiresIn: "15m" }
    );
    const refreshToken = jwt.sign(
      { id: user.id },
      process.env.JWT_REFRESH_TOKEN_SECRET!,
      { expiresIn: "1d" }
    );

    //storing the refresh token in redis
    await redis.set(
      `refreshToken:${user.id}`,
      refreshToken,
      "EX",
      60 * 60 * 24
    );

    const { name, role, id, email, verified, profilePicture } = user;
    return {
      accessToken,
      refreshToken,
      name,
      role,
      id,
      email,
      verified,
      profilePicture,
    };
  }

  async signOut({ refreshToken }: SignOutParams): Promise<SignOutResponse> {
    const decoded = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_TOKEN_SECRET!
    ) as { id: string };
    if (!decoded || !decoded.id) {
      throw new Error("Invalid token: user ID not found");
    }
    await redis.del(`refreshToken:${decoded.id}`);
    return { message: "Success" };
  }

  async registerInstructor(
    data: RegisterInstructorParams,
    currentUser: CurrentUser
  ): Promise<RegisterInstructorResponse> {
    try {
      const user = await this.userRepository.findById(currentUser.id);
      if (!user) {
        throw new NotFoundError("User Not Found");
      }
      const { headline, biography, ...links } = data;
      const updatedUser = await this.userRepository.update(
        currentUser.id,
        { verified: "pending", headline, biography, links },
        {}
      );
      return { message: "Success" };
    } catch (error) {
      throw error;
    }
  }
}
