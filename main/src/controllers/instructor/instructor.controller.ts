// src/interfaces/controllers/AuthController.ts
import { NextFunction, Request, Response } from "express";
import { InstructorService } from "../../services/instructor/instructor.service";
import { StatusCode } from "../../enums/status-code.enum";
import { IInstructorController } from "./instructor.interface";
import { GetAnalyticsRequestSchema } from "./request.dto";
//external dependencies

export class InstructorController implements IInstructorController {
  constructor(private readonly instructorService: InstructorService) {}

  async getProfile(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const user = req.verifiedUser;
      const data = await this.instructorService.getProfile(user?.id!);
      res.status(StatusCode.OK).send(data);
    } catch (error) {
      next(error);
    }
  }

  async getAnalyticsSummary(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const user = req.verifiedUser;
      const result = await this.instructorService.getAnalyticsSummary(
        user?.id!
      );
      res.status(StatusCode.OK).send(result);
    } catch (error) {
      next(error);
    }
  }
  async getAnalytics(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const user = req.verifiedUser;
      const {filter} = GetAnalyticsRequestSchema.parse(req.query);
      const result = await this.instructorService.getAnalytics(
        user?.id!,filter
      );
      res.status(StatusCode.OK).send(result);
    } catch (error) {
      next(error);
    }
  }
}
