import { NextFunction, Request, Response } from "express";
import { BadRequestError } from "../../util/errors/bad-request-error";
import { StatusCode } from "../../enums/status-code.enum";
import { IUserController } from "./user.interface";
import {
  GetInstructorProfileResponseSchema,
  GetProfileResponseSchema,
  NullResponseSchema,
} from "@academia-dev/common";
import { inject, injectable } from "inversify";
import { Types } from "../../container/types";
import { BlockUserRequestSchema } from "../admin/request.dto";
import { IUserService } from "../../services/user/user.interface";
import { PutUserProfileRequestSchemaRequestSchema } from "./request.dto";

@injectable()
export class UserController implements IUserController {
  constructor(
    @inject(Types.UserService) private readonly userService: IUserService
  ) {}

  async putProfile(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.verifiedUser!;
      const payload = PutUserProfileRequestSchemaRequestSchema.parse({
        ...req.body,
        userId: id,
      });
      const result = await this.userService.updateProfile(payload);
      const response = NullResponseSchema.parse({
        status: "success",
        code: StatusCode.OK,
        message: "success",
        data: null,
      });
      res.status(response.code).send(response);
    } catch (error) {
      next(error);
    }
  }

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
      const result = await this.userService.getProfile(userId);
      const response = GetProfileResponseSchema.parse({
        status: "success",
        code: StatusCode.OK,
        message: "success",
        data: result,
      });
      res.status(response.code).send(response);
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

  async blockUser(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { userId } = BlockUserRequestSchema.parse(req.params);
      await this.userService.blockUser(userId);
      const response = NullResponseSchema.parse({
        status: "success",
        code: StatusCode.OK,
        message: "success",
        data: null,
      });
      res.status(200).send(response);
    } catch (error) {
      next(error);
    }
  }
}
