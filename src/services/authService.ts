// src/services/AuthService.ts
import { UserRepository } from "../repositories/userRepository";
//services

import { transporter } from "../util/emailClient";
import { redis } from "../config/redisClient";

//errors
import { RequestValidationError } from "../errors/request-validaion-error";
import { ExistingUserError } from "../errors/existing-user-error";
import { AppError } from "../errors/app-error";

//externl dependencies
import bcrypt from "bcryptjs";
import { authenticator } from "otplib";
import validator from "validator";
import jwt, { JwtPayload } from "jsonwebtoken";
import { BadRequestError } from "../errors/bad-request-error";
import { StatusCode } from "../enums/statusCode.enum";
import { NotFoundError } from "../errors/not-found-error";

interface ICurrentUser {
  email: string;
  id: string;
  role: string;
}

export class AuthService {
  constructor(private userRepository: UserRepository) {}

  async refreshToken(token: string): Promise<{
    accessToken: string;
    id: string;
    role: string;
    name: string;
    email: string;
    refreshToken: string;
    verified:string;
  } | null> {
    try {
      const payload = jwt.verify(
        token,
        process.env.JWT_REFRESH_TOKEN_SECRET!
      ) as null|JwtPayload;

      if (!payload) {
        return null;
      }
      const userExists = await redis.get(`refreshToken:${payload.id}`);
      if (!userExists) {
        return null;
      }
      const user = await this.userRepository.findById(payload.id);
      if (!user || user.isBlocked) {
        return null;
      }

      const accessToken = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        process.env.JWT_ACCESS_TOKEN_SECRET!,
        { expiresIn: "15m" }
      );
      // Creating refresh token everytime /refresh endpoint hits (Refresh token rotation)
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

      return {
        accessToken,
        id: user.id,
        role: user.role,
        name: user.name,
        email: user.email,
        refreshToken,
        verified:user.verified
      };
    } catch (error) {
      return null;
    }
  }
  async signUp(input: { name: string; email: string; password: string }) {
    const { name, email, password } = input;

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

    const existingUser = await this.userRepository.findByEmail(email);

    if (existingUser) {
      throw new ExistingUserError();
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    let secret = authenticator.generateSecret();
    let token = authenticator.generate(secret);

    const tempUser = { name, email, password: hashedPassword };
    console.log("The otp is ", token);
    // sending email

/*     let mailOptions = {
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
        console.log(error)
        throw new AppError("Failed to send email.", StatusCode.INTERNAL_SERVER_ERROR, [
          { message: "Unable to send verification email. Please try again later." },
        ]);
      } */
    await redis.setex(`tempUser:${email}`, 300, JSON.stringify(tempUser));
    await redis.set(`otp:${email}`, token, "EX", 69);
    return true;
  }

  async verifyOtp(otp: string, email: string) {
    if (!otp || !email) {
      throw new AppError("Enter Otp", 400);
    }
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
    const tempUser = await JSON.parse(data);

    const user = await this.userRepository.createUser(tempUser);
    await redis.del(`tempUser:${email}`);

    return { message: "User Created Successfully" };
  }
  async resendOtp(email:string){

    let secret = authenticator.generateSecret();
    let token = authenticator.generate(secret);

    console.log("The otp is ", token);
    // sending email

/*     let mailOptions = {
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
        console.log(error)
        throw new AppError("Failed to send email.", StatusCode.INTERNAL_SERVER_ERROR, [
          { message: "Unable to send verification email. Please try again later." },
        ]);
      } */
    await redis.set(`otp:${email}`, token, "EX", 69);
    return true;
  }

  async signIn(email: string, password: string) {
    const user = await this.userRepository.findByEmail(email);

    if (!user) throw new AppError("Invalid Email or password", 401);

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) throw new AppError("Invalid Email or password", 401);

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

    const { name, role, id, email: userEmail } = user;
    return { accessToken, refreshToken, name, role, id, userEmail };
  }

  async signOut(refreshToken: string) {
    const decoded = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_TOKEN_SECRET!
    ) as { id: string };
    if (!decoded || !decoded.id) {
      throw new Error("Invalid token: user ID not found");
    }
    await redis.del(`refreshToken:${decoded.id}`);
    return true;
  }

  async registerInstructor(
    data: {
      headline: string;
      biography: string;
      facebook: string;
      linkedin: string;
      twitter: string;
      website: string;
      agreement: boolean;
    },
    currentUser: ICurrentUser
  ) {
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
    
    const validationErrors = validateInstructorData(data);
    if (validationErrors.length > 0) {
      throw new AppError(
        "Validation Error",
        StatusCode.BAD_REQUEST,
        validationErrors
      );
    }
   
    const user = await this.userRepository.findById(currentUser.id);
    if (!user) {
      throw new NotFoundError("User Not Found");
    }
    const { headline, biography, ...links } = data;
    Object.assign(user, { verified: "pending", headline, biography, links });
    const updatedUser=await this.userRepository.save(user);
    return updatedUser;
  }
}
