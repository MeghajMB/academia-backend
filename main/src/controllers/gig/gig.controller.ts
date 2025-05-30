import { NextFunction, Request, Response } from "express";
import { StatusCode } from "../../enums/status-code.enum";
import { AppError } from "../../util/errors/app-error";
import {
  CreateGigRequestSchema,
  DeleteGigRequestSchema,
  GetActiveGigsOfInstructorRequestSchema,
  GetGigByIdRequestSchema,
  GetGigsOfInstructorRequestSchema,
  UpdateGigRequestSchema,
} from "./request.dto";
import {
  CreateGigResponseSchema,
  GetActiveGigsOfInstructorResponseSchema,
  GetActiveGigsResponseSchema,
  GetGigByIdResponseSchema,
  GetGigsOfInstructorResponseSchema,
  NullResponseSchema,
} from "@academia-dev/common";
import { IGigController } from "./gig.interface";
import { inject, injectable } from "inversify";
import { Types } from "../../container/types";
import { IGigService } from "../../services/gig/gig.interface";

@injectable()
export class GigController implements IGigController {
  private readonly pageLimit = 10;
  constructor(
    @inject(Types.GigService) private readonly gigService: IGigService
  ) {}

  async getGigsOfInstructor(req: Request, res: Response, next: NextFunction) {
    try {
      const payload = GetGigsOfInstructorRequestSchema.parse({
        ...req.query,
        limit: this.pageLimit,
      });
      const userId = req.verifiedUser!.id;

      const gig = await this.gigService.getAllGigsOfInstructor(payload, userId);
      const response = GetGigsOfInstructorResponseSchema.parse({
        status: "success",
        code: StatusCode.CREATED,
        message: "Gigs retrived successfully",
        data: gig,
      });
      res.status(response.code).json(response);
    } catch (error) {
      next(error);
    }
  }
  async createGig(req: Request, res: Response, next: NextFunction) {
    try {
      const gigData = CreateGigRequestSchema.parse(req.body);
      const userId = req.verifiedUser!.id;

      const gig = await this.gigService.createGig(gigData, userId);
      const response = CreateGigResponseSchema.parse({
        status: "success",
        code: StatusCode.CREATED,
        message: "Gig created successfully",
        data: gig,
      });
      res.status(response.code).json(response);
    } catch (error) {
      next(error);
    }
  }

  async getGigById(req: Request, res: Response, next: NextFunction) {
    try {
      const { gigId } = GetGigByIdRequestSchema.parse(req.params);
      const gig = await this.gigService.getGigById(gigId);
      const response = GetGigByIdResponseSchema.parse({
        status: "success",
        code: StatusCode.OK,
        message: "Gig retrieved successfully",
        data: gig,
      });
      res.status(response.code).json(response);
    } catch (error) {
      next(error);
    }
  }

  async getActiveGigs(req: Request, res: Response, next: NextFunction) {
    try {
      const gigs = await this.gigService.getActiveGigs();
      const response = GetActiveGigsResponseSchema.parse({
        status: "success",
        code: StatusCode.OK,
        message: "Active gigs retrieved successfully",
        data: gigs,
      });
      res.status(response.code).json(response);
    } catch (error) {
      console.log(error);
      next(error);
    }
  }
  async getActiveGigsOfInstructor(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const user = req.verifiedUser;
      const { instructorId } = GetActiveGigsOfInstructorRequestSchema.parse(
        req.params
      );
      if (user?.role === "instructor" && user.id !== instructorId) {
        throw new AppError(
          "You don't have access to this file",
          StatusCode.FORBIDDEN
        );
      }
      const gigs = await this.gigService.getActiveGigsOfInstructor(
        instructorId
      );
      const response = GetActiveGigsOfInstructorResponseSchema.parse({
        status: "success",
        code: StatusCode.OK,
        message: "Active gigs of instructor retrieved successfully",
        data: gigs,
      });
      res.status(response.code).json(response);
    } catch (error) {
      console.log(error);
      next(error);
    }
  }

  async updateGig(req: Request, res: Response, next: NextFunction) {
    try {
      const { id, ...updates } = UpdateGigRequestSchema.parse({
        id: req.params.gigId,
        ...req.body,
      });
      const updatedGig = await this.gigService.updateGig(id, updates);
      const response = NullResponseSchema.parse({
        status: "success",
        code: StatusCode.OK,
        message: "Gig updated successfully",
        data: null,
      });
      res.status(StatusCode.OK).json(response);
    } catch (error) {
      next(error);
    }
  }

  async deleteGig(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = DeleteGigRequestSchema.parse({ id: req.params.gigId });
      await this.gigService.deleteGig(id);
      const response = NullResponseSchema.parse({
        status: "success",
        code: StatusCode.NO_CONTENT,
        message: "Gig deleted successfully",
        data: null,
      });
      res.status(response.code).json(response);
    } catch (error) {
      next(error);
    }
  }
}
