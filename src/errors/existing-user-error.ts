import { CustomError } from "./custom-error";

export class ExistingUserError extends CustomError {
  reason = "User Already Exists";
  statusCode = 409;
  constructor() {
    super("User Already Exists");
    Object.setPrototypeOf(this, ExistingUserError.prototype);
  }
  serializeErrors() {
    return [{ message: this.reason }];
  }
}
