import { Request, Response, NextFunction } from "express";
import { CustomError } from "../util/errors/custom-error";
import { AppError } from "../util/errors/app-error";
import { BadRequestError } from "../util/errors/bad-request-error";
import { z } from "zod";
import { StatusCode } from "../enums/status-code.enum";

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (
    err instanceof CustomError ||
    err instanceof AppError ||
    err instanceof BadRequestError
  ) {
    return res.status(err.statusCode).json({
      status: "error",
      code: err.statusCode,
      message: err.message,
      errors: err.serializeErrors(),
    });
  }
  if (err instanceof z.ZodError) {
    const errors = err.errors.map((e) => ({
      message: e.message,
      field: e.path.join("."),
    }));
    return res.status(StatusCode.BAD_REQUEST).json({
      status: "error",
      code: StatusCode.BAD_REQUEST,
      message: "Validation failed",
      errors,
    });
  }

  return res
    .status(StatusCode.INTERNAL_SERVER_ERROR)
    .send({
      status: "error",
      code: StatusCode.INTERNAL_SERVER_ERROR,
      message: "Internal server error",
      errors: [{ message: "Something went wrong" }],
    });
};
