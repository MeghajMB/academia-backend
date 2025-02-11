// src/interfaces/controllers/AuthController.ts
import { NextFunction, Request, Response } from "express";
//errors
import { AppError } from "../errors/app-error";
import { BadRequestError } from "../errors/bad-request-error";
import { StatusCode } from "../enums/statusCode.enum";
import { CourseService } from "../services/courseService";

export class CourseController {
  constructor(private courseService: CourseService) {}

  async getCurrriculum(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { courseId } = req.params;
      if (!courseId) {
        throw new BadRequestError("Provide the id");
      }
      const curriculum = await this.courseService.getCurriculum(courseId);
      res.status(StatusCode.OK).send(curriculum);
    } catch (error) {
      next(error);
    }
  }
}
