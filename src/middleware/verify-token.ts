import jwt, { JwtPayload } from "jsonwebtoken";
import { NextFunction, Request, Response } from "express";
import { AppError } from "../errors/app-error";
import { redis } from "../config/redisClient";
import { StatusCode } from "../enums/statusCode.enum";

interface CustomJwtPayload {
  id: string;
  email: string;
  role: string;
}

export const verifyToken =async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers["authorization"]; // Can also use req.headers.Authorization

    if (!authHeader) {
      throw new AppError("Authorization header is missing", 401);
    }

    // Extract the token (Bearer <token>)
    const token = authHeader.split(" ")[1];

    if (!token) {
      throw new AppError("Token is missing", 401);
    }

    let decoded: JwtPayload | string;
    try {
      decoded = jwt.verify(token, process.env.JWT_ACCESS_TOKEN_SECRET!);
    } catch (err) {
      throw new AppError("Invalid or expired token", StatusCode.FORBIDDEN);
    }

    const verifiedUser = decoded as CustomJwtPayload;

    // Check if the user exists in Redis
    const userExists = await redis.get(`refreshToken:${verifiedUser.id}`);
    if (!userExists) {
      throw new AppError("User does not exist or session has expired", StatusCode.FORBIDDEN);
    }

    // Attach the verified user to the request object
    req.verifiedUser = verifiedUser;
    next();
      
    
  } catch (error) {
    next(error);
  }
};
