import { NextFunction, Request, Response } from "express";
import { GigService } from "../services/gigService";
import { StatusCode } from "../enums/statusCode.enum";
import { ICreateGigDTO } from "../types/gig.interface.";
import { BadRequestError } from "../errors/bad-request-error";
import { AppError } from "../errors/app-error";

export class GigController {
  constructor(private gigService: GigService) {}

  async createGig(req: Request, res: Response, next: NextFunction) {
    try {
      const gigData = req.body as ICreateGigDTO;
      const userId = req.verifiedUser!.id;

      if (
        !gigData.serviceDate ||
        !gigData.description ||
        //!gigData.biddingAllowed ||
        !gigData.sessionDuration ||
        !gigData.maxParticipants ||
        !gigData.minBid ||
        !gigData.title
      ) {
        throw new BadRequestError("Must give all details");
      }
      const gig = await this.gigService.createGig(gigData, userId);
      res.status(StatusCode.CREATED).json(gig);
    } catch (error) {
      next(error);
    }
  }

  async getGigById(req: Request, res: Response, next: NextFunction) {
    try {
      const gigId = req.params.gigId;
      const gig = await this.gigService.getGigById(gigId);
      res.status(StatusCode.OK).json(gig);
    } catch (error) {
      next(error);
    }
  }

  async getActiveGigs(req: Request, res: Response, next: NextFunction) {
    try {
      const gigs = await this.gigService.getActiveGigs();
      res.status(StatusCode.OK).json(gigs);
    } catch (error) {
      console.log(error);
      next(error);
    }
  }
  async getActiveGigsOfInstructor(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.verifiedUser;
      const instructorId=req.params.instructorId;
      if(user?.role=='instructor'&&user.id!==instructorId){
        throw new AppError('You dont have access to this file',StatusCode.FORBIDDEN)
      }
      const gigs = await this.gigService.getActiveGigsOfInstructor(instructorId);
      res.status(StatusCode.OK).json(gigs);
    } catch (error) {
      console.log(error);
      next(error);
    }
  }

  async updateGig(req: Request, res: Response, next: NextFunction) {
    try {
      const updatedGig = await this.gigService.updateGig(
        req.params.id,
        req.body
      );
      res.status(StatusCode.OK).json(updatedGig);
    } catch (error) {
      next(error);
    }
  }

  async deleteGig(req: Request, res: Response, next: NextFunction) {
    try {
      await this.gigService.deleteGig(req.params.id);
      res.status(StatusCode.NO_CONTENT).send();
    } catch (error) {
      next(error);
    }
  }
}
