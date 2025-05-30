import { NextFunction, Request, Response } from "express";
import { StatusCode } from "../../enums/status-code.enum";
import { IInstructorController } from "./instructor.interface";
import { GetAnalyticsRequestSchema } from "./request.dto";
import { inject, injectable } from "inversify";
import { Types } from "../../container/types";
import { IInstructorService } from "../../services/instructor/instructor.interface";

@injectable()
export class InstructorController implements IInstructorController {
  constructor(
    @inject(Types.InstructorService)
    private readonly instructorService: IInstructorService
  ) {}

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
      const { filter } = GetAnalyticsRequestSchema.parse(req.query);
      const result = await this.instructorService.getAnalytics(
        user?.id!,
        filter
      );
      res.status(StatusCode.OK).send(result);
    } catch (error) {
      next(error);
    }
  }
}
