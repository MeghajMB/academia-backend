import { NextFunction, Request, Response } from "express";
import { UserService } from "../../services/user/user.service";
//errors
import { BadRequestError } from "../../util/errors/bad-request-error";
import { StatusCode } from "../../enums/status-code.enum";
import { IUserController } from "./user.interface";
import { GetInstructorProfileResponseSchema } from "./response.dto";

export class UserController implements IUserController {
  constructor(private readonly userService: UserService) {}

  async getProfile(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { userId } = req.params;
      if (!userId) {
        throw new BadRequestError("Specify userid");
      }
      const data = await this.userService.getProfile(userId);
      res.status(StatusCode.OK).send(data);
    } catch (error) {
      next(error);
    }
  }
  async getInstructorProfile(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { instructorId } = req.params;
      if (!instructorId) {
        throw new BadRequestError("Specify userid");
      }
      const result = await this.userService.getInstructorProfile(instructorId);
      const response = GetInstructorProfileResponseSchema.parse({
        status: "success",
        code: StatusCode.CREATED,
        message: "Successfully fetched Instructor Profile",
        data: result,
      });
      res.status(response.code).json(response);
    } catch (error) {
      next(error);
    }
  }
}
