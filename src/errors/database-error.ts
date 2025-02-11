import { CustomError } from "./custom-error";

export class DatabaseError extends CustomError {
  statusCode: number;
  reason: string;

  constructor(reason: string, statusCode: number = 500) {
    super(reason);
    this.reason = reason;
    this.statusCode = statusCode;

    Object.setPrototypeOf(this, DatabaseError.prototype);
  }

  serializeErrors() {
    return [{ message: this.reason }];
  }
}
