import { GigRepository } from "../repositories/gigRepository";
import { IGigDocument } from "../models/gigModel";
import { AppError } from "../errors/app-error";
import { StatusCode } from "../enums/statusCode.enum";
import mongoose from "mongoose";
import { IActiveGig, ICreateGigDTO } from "../types/gig.interface.";
import moment from "moment-timezone";
import { BadRequestError } from "../errors/bad-request-error";
import { scheduleAuctionClose } from "../config/bullmq";

export class GigService {
  constructor(private gigRepository: GigRepository) {}

  async createGig(
    gigData: ICreateGigDTO,
    instructorId: string
  ): Promise<IGigDocument> {
    try {
      const cleanedDate = gigData.sessionDate.split("[")[0]; // Remove timezone region
      const sessionDate = moment.utc(cleanedDate).tz("Asia/Kolkata"); // Convert to Moment object

      if (!sessionDate.isValid()) {
        throw new BadRequestError("Invalid service date format.");
      }
      const currentDate = moment().tz("Asia/Kolkata");

      // Calculate bidding expiration (24 hours before sessionDate)
      const biddingExpiresAt = moment(sessionDate).subtract(24, "hours");

      if (biddingExpiresAt.isBefore(currentDate)) {
        throw new BadRequestError(
          "Bidding cannot start because there is less than 24 hours before the service date."
        );
      }
      const durationInMinutes = Number(gigData.sessionDuration);
      // Check for conflicting gigs
      const existingGig = await this.gigRepository.findConflictingGig(
        instructorId,
        sessionDate.toDate(),
        durationInMinutes
      );
      if (existingGig) {
        throw new AppError(
          "Another gig is already scheduled at this time.",
          StatusCode.CONFLICT
        );
      }

      const updatedGigData = {
        instructorId: new mongoose.Types.ObjectId(instructorId),
        title: gigData.title,
        description: gigData.description,
        sessionDuration: durationInMinutes,
        minBid: Math.ceil(Number(gigData.minBid)),
        sessionDate: sessionDate.toDate(), // Convert to Date object
        biddingExpiresAt: biddingExpiresAt.toDate(), // 24 hrs before sessionDate
        //biddingExpiresAt: new Date(Date.now() + 120000),
      };

      const newGig = await this.gigRepository.createGig(updatedGigData);
      await scheduleAuctionClose(newGig.id, biddingExpiresAt.toDate());
      //await scheduleAuctionClose(newGig.id, new Date(Date.now() + 15000));
      return newGig;
    } catch (error) {
      throw error;
    }
  }

  async getGigById(id: string): Promise<IGigDocument | null> {
    const gig = await this.gigRepository.findById(id);
    if (!gig) {
      throw new AppError("Gig not found", StatusCode.NOT_FOUND);
    }
    return gig;
  }

  async updateGig(
    id: string,
    updateData: Partial<IGigDocument>
  ): Promise<IGigDocument | null> {
    const updatedGig = await this.gigRepository.update(id, updateData);
    if (!updatedGig) {
      throw new AppError("Gig not found", StatusCode.NOT_FOUND);
    }
    return updatedGig;
  }

  async deleteGig(id: string): Promise<void> {
    try {
      const gig = await this.gigRepository.delete(id);
      if (!gig) {
        throw new AppError("Gig not found", StatusCode.NOT_FOUND);
      }
    } catch (error) {
      throw error;
    }
  }

  async getActiveGigs(): Promise<IActiveGig[]> {
    try {
      const gigs = await this.gigRepository.getActiveGigsWithPopulatedData();
      const updatedGigs = gigs.map((gig) => {
        return {
          id: gig._id as string,
          instructorId: gig.instructorId._id as string,
          instructorName: gig.instructorId.name,
          instructorProfilePicture: gig.instructorId.profilePicture,
          title: gig.title,
          sessionDuration: gig.sessionDuration,
          minBid: gig.minBid,
          biddingExpiresAt: gig.biddingExpiresAt,
          sessionDate: gig.sessionDate,
        };
      });
      return updatedGigs;
    } catch (error) {
      throw error;
    }
  }

  async getActiveGigsOfInstructor(userId: string): Promise<IGigDocument[]> {
    try {
      const activeGigs = await this.gigRepository.getActiveGigsOfInstructor(
        userId
      );

      return activeGigs;
    } catch (error) {
      throw error;
    }
  }
}
