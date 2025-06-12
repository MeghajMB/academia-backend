import { CustomError } from "./custom-error";

export class AppError extends CustomError {
  statusCode: number;
  details?: { message: string; field?: string }[];

  constructor(
    message: string,
    statusCode = 500,
    details?: { message: string; field?: string }[]
  ) {
    super(message);
    this.message = message;
    this.statusCode = statusCode;
    this.details = details;

    // Set the prototype explicitly for extending Error
    Object.setPrototypeOf(this, AppError.prototype);
  }

  serializeErrors() {
    return this.details ?? [{ message: this.message }];
  }
}
