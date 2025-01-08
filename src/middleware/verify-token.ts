import jwt from "jsonwebtoken";
import { NextFunction, Request, Response } from "express";
import { AppError } from "../errors/app-error";
export const verifyToken = (
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
    jwt.verify(token, process.env.JWT_ACCESS_TOKEN_SECRET!, (err, decoded) => {
      if (err) {
        throw new AppError("Invalid or expired token", 403);
      }
      req.user = decoded;
      next();
    });
  } catch (error) {
    next(error);
  }
};
