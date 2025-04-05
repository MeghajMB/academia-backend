// src/interfaces/controllers/AuthController.ts
import { NextFunction, Request, Response } from "express";
import { InstructorService } from "../../services/implementations/instructor.service";
import { StatusCode } from "../../enums/status-code.enum";
import { IInstructorController } from "../interfaces/instructor-controller.interface";
//external dependencies

export class InstructorController implements IInstructorController {
  constructor(private instructorService: InstructorService) {}

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

}
