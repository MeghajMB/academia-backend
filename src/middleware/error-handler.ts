import { Request, Response, NextFunction } from "express";
import { CustomError } from "../util/errors/custom-error";
import { AppError } from "../util/errors/app-error";
import { BadRequestError } from "../util/errors/bad-request-error";

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
    return res.status(err.statusCode).send({ errors: err.serializeErrors() });
  }

  return res
    .status(400)
    .send({ errors: [{ message: "Something Went Wrong" }] });
};
