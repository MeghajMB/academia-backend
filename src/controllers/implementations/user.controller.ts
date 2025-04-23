// src/interfaces/controllers/AuthController.ts
import { NextFunction, Request, Response } from "express";
import { UserService } from "../../services/user/user.service";
//errors
import { AppError } from "../../util/errors/app-error";
import { BadRequestError } from "../../util/errors/bad-request-error";
import { StatusCode } from "../../enums/status-code.enum";
import { IUserController } from "../interfaces/user-controller.interface";

export class UserController implements IUserController {

  constructor(private userService: UserService) {}

  async getProfile(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    
    try {
      const {userId}=req.params;
      if(!userId){
        throw new BadRequestError("Specify userid")
      }
      const data=await this.userService.getProfile(userId)
      res.status(StatusCode.OK).send(data);
    } catch (error) {
      next(error)
    }
  }
  async getInstructorProfile(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    
    try {
      const {instructorId}=req.params;
      if(!instructorId){
        throw new BadRequestError("Specify userid")
      }
      const data=await this.userService.getInstructorProfile(instructorId)
      res.status(StatusCode.OK).send(data);
    } catch (error) {
      next(error)
    }
  }
}
