  export abstract class CustomError extends Error {
    abstract statusCode: number;
    constructor(errorMessage: string) {
      super(errorMessage);
      Object.setPrototypeOf(this, CustomError.prototype);
    }
    abstract serializeErrors(): { message: string; field?: string }[];
  }
  