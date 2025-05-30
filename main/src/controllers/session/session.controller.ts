import { NextFunction, Request, Response } from "express";
import { StatusCode } from "../../enums/status-code.enum";
import { ISessionController } from "./session.interface";
import { ISessionService } from "../../services/session/session.interface";
import { GetSessionsOfUserRequestSchema } from "./request.dto";
import { GetSessionsOfUserResponseSchema } from "@academia-dev/common";
import { inject, injectable } from "inversify";
import { Types } from "../../container/types";

@injectable()
export class SessionController implements ISessionController {
  private pageLimit = 10;
  constructor(
    @inject(Types.SessionService)
    private readonly sessionService: ISessionService
  ) {}

  async getSessionsOfUser(req: Request, res: Response, next: NextFunction) {
    try {
      const payload = GetSessionsOfUserRequestSchema.parse({
        ...req.query,
        limit: this.pageLimit,
      });
      const userId = req.verifiedUser!.id;

      const result = await this.sessionService.getSessionsOfUser(
        payload,
        userId
      );

      const response = GetSessionsOfUserResponseSchema.parse({
        status: "success",
        code: StatusCode.CREATED,
        message: "Sessions retrived successfully",
        data: result,
      });
      res.status(response.code).json(response);
    } catch (error) {
      console.log(error);
      next(error);
    }
  }
}
