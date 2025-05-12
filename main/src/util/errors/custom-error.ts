export abstract class CustomError extends Error {
  abstract statusCode: number;
  message: string;
  constructor(message: string) {
    super(message);
    this.message = message;
    Object.setPrototypeOf(this, CustomError.prototype);
  }
  abstract serializeErrors(): { message: string; field?: string }[];
}
