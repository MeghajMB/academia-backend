import jwt, { JwtPayload } from "jsonwebtoken";
import { NextFunction, Request, Response } from "express";
import { AppError } from "../util/errors/app-error";
import { redis } from "../lib/redis";
import { StatusCode } from "../enums/status-code.enum";
import { CustomJwtPayload } from "../types/jwt";

export const verifyToken = async (
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
      throw new AppError("TOKEN_EXPIRED", StatusCode.FORBIDDEN);
    }

    const verifiedUser = decoded as CustomJwtPayload;

    // Check if the user exists in Redis
    const userExists = await redis.get(`refreshToken:${verifiedUser.id}`);
    if (!userExists) {
      throw new AppError(
        "TOKEN_EXPIRED",
        StatusCode.FORBIDDEN
      );
    }

    // Attach the verified user to the request object
    req.verifiedUser = verifiedUser
    next();
  } catch (error) {
    next(error);
  }
};
