// src/interfaces/controllers/AuthController.ts
import { NextFunction, Request, Response } from "express";
import { UserService } from "../services/userService";
//errors
import { AppError } from "../errors/app-error";
import { BadRequestError } from "../errors/bad-request-error";
import { StatusCode } from "../enums/statusCode.enum";

export class UserController {

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
}
