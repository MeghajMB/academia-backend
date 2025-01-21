// src/interfaces/controllers/AuthController.ts
import { NextFunction, Request, Response } from "express";
import { InstructorService } from "../services/instructorService";
//errors
import { AppError } from "../errors/app-error";
import { BadRequestError } from "../errors/bad-request-error";
import { StatusCode } from "../enums/statusCode.enum";

export class InstructorController {
  constructor(private instructorService: InstructorService) {}

  async getProfile(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const user = req.verifiedUser;
      const data = await this.instructorService.getProfile(user!);
      res.status(StatusCode.OK).send(data);
    } catch (error) {
      next(error);
    }
  }
  async createCourse(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const user = req.verifiedUser;
      const courseData=req.body;
      const data = await this.instructorService.createCourse(courseData,user!);
      res.status(StatusCode.OK).send(data);
    } catch (error) {
      next(error);
    }
  }
}
