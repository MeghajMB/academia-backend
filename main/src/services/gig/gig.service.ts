import { GigDocument } from "../../models/gig.model";
import { AppError } from "../../util/errors/app-error";
import { StatusCode } from "../../enums/status-code.enum";
import mongoose from "mongoose";
import moment from "moment-timezone";
import { BadRequestError } from "../../util/errors/bad-request-error";
import { scheduleAuctionClose } from "../../queues/auction.queue";
import { GigRepository } from "../../repositories/gig/gig.repository";
import {
  CreateGigParams,
  CreateGigServiceResponse,
  GetActiveGigsResponse,
  UpdateGigServiceParams,
} from "./gig.types";
import { IGigService } from "./gig.interface";
import { inject, injectable } from "inversify";
import { Types } from "../../container/types";

@injectable()
export class GigService implements IGigService {
  constructor(
    @inject(Types.GigRepository) private readonly gigRepository: GigRepository
  ) {}

  async createGig(
    gigData: CreateGigParams,
    instructorId: string
  ): Promise<CreateGigServiceResponse> {
    try {
      const momentSessionDate = moment(gigData.sessionDate);

      if (!momentSessionDate.isValid()) {
        throw new BadRequestError("Invalid service date format.");
      }
      const sessionDate = momentSessionDate.toDate();
      //uncomment in production

      const currentDate = moment.utc();

      // Calculate bidding expiration (24 hours before sessionDate)
      const biddingExpiresAt = moment.utc(sessionDate).subtract(24, "hours");

      if (biddingExpiresAt.isBefore(currentDate)) {
        throw new BadRequestError(
          "Bidding cannot start because there is less than 24 hours before the service date."
        );
      }

      // Check for conflicting gigs
      const existingGig = await this.gigRepository.findConflictingGig(
        instructorId,
        sessionDate,
        gigData.sessionDuration
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
        sessionDuration: gigData.sessionDuration,
        minBid: Math.ceil(Number(gigData.minBid)),
        sessionDate: sessionDate, // Convert to Date object
        biddingExpiresAt: biddingExpiresAt.toDate(), // 24 hrs before sessionDate
        /* development code */
        //biddingExpiresAt: new Date(Date.now() + 120000), //development
      };

      const newGig = await this.gigRepository.create(updatedGigData);
      await scheduleAuctionClose(newGig.id, biddingExpiresAt.toDate());
      /* development Code Begin */
      /* await scheduleAuctionClose(
        newGig._id.toString(),
        new Date(Date.now() + 120000)
      ); */
      /* development Code End */
      const updatedGig = {
        id: newGig._id.toString(),
        sessionDate: newGig.sessionDate.toISOString(),
        description: newGig.description,
        biddingAllowed: newGig.biddingAllowed,
        sessionDuration: newGig.sessionDuration,
        maxParticipants: newGig.maxParticipants,
        minBid: newGig.minBid,
        status: newGig.status,
        currentBid: newGig.currentBid,
        title: newGig.title,
        instructorId: newGig.instructorId.toString(),
        biddingExpiresAt: newGig.biddingExpiresAt.toISOString(),
        createdAt: newGig.createdAt.toISOString(),
      };
      return updatedGig;
    } catch (error) {
      throw error;
    }
  }

  async getGigById(id: string): Promise<{
    id: string;
    instructorId: string;
    title: string;
    description: string;
    sessionDuration: number;
    minBid: number;
    currentBid: number;
    currentBidder: string | null;
    status: "active" | "missed" | "expired" | "completed" | "no-bids";
    biddingExpiresAt: string;
    sessionDate: string;
    createdAt: string;
  } | null> {
    try {
      const gig = await this.gigRepository.findById(id);
      if (!gig) {
        throw new AppError("Gig not found", StatusCode.NOT_FOUND);
      }
      const updatedGig = {
        id: gig._id.toString(),
        instructorId: gig.instructorId.toString(),
        title: gig.title,
        description: gig.description,
        sessionDuration: gig.sessionDuration,
        minBid: gig.minBid,
        currentBid: gig.currentBid,
        currentBidder: gig.currentBidder?.toString() || null,
        status: gig.status,
        biddingExpiresAt: gig.biddingExpiresAt.toISOString(),
        sessionDate: gig.sessionDate.toISOString(),
        createdAt: gig.createdAt.toISOString(),
      };
      return updatedGig;
    } catch (error) {
      throw error;
    }
  }
  async getAllGigsOfInstructor(
    {
      limit,
      status,
      page = "1",
      search,
      sort,
    }: {
      limit: number;
      status?: "active" | "expired" | "completed" | "no-bids" | "missed";
      sort?: string;
      page?: string;
      search?: string;
    },
    userId: string
  ): Promise<any> {
    try {
      const pageNum = parseInt(page) || 1;
      const skip = (pageNum - 1) * limit;

      const gigs = await this.gigRepository.getPaginatedGigs({
        limit,
        status,
        skip,
        search,
        sort,
        userId,
      });

      const updatedGigs = gigs.map((gig) => {
        return {
          id: gig._id.toString(),
          sessionDate: gig.sessionDate.toISOString(),
          description: gig.description,
          biddingAllowed: gig.biddingAllowed,
          sessionDuration: gig.sessionDuration,
          maxParticipants: gig.maxParticipants,
          minBid: gig.minBid,
          status: gig.status,
          currentBid: gig.currentBid,
          currentBidder: gig.currentBidder
            ? gig.currentBidder.toString()
            : null,
          title: gig.title,
          instructorId: gig.instructorId.toString(),
          biddingExpiresAt: gig.biddingExpiresAt.toISOString(),
          createdAt: gig.createdAt.toISOString(),
        };
      });
      return updatedGigs;
    } catch (error) {
      throw error;
    }
  }

  async updateGig(
    id: string,
    updateData: UpdateGigServiceParams
  ): Promise<GigDocument | null> {
    try {
      const updatedGig = await this.gigRepository.update(id, updateData, {});
      if (!updatedGig) {
        throw new AppError("Gig not found", StatusCode.NOT_FOUND);
      }
      return updatedGig;
    } catch (error) {
      throw error;
    }
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

  async getActiveGigs(): Promise<GetActiveGigsResponse[]> {
    try {
      const gigs = await this.gigRepository.getActiveGigsWithPopulatedData();
      const updatedGigs = gigs.map((gig) => {
        return {
          id: gig._id.toString(),
          instructorId: gig.instructorId._id.toString(),
          instructorName: gig.instructorId.name,
          instructorProfilePicture: gig.instructorId.profilePicture,
          title: gig.title,
          sessionDuration: gig.sessionDuration,
          minBid: gig.minBid,
          biddingExpiresAt: gig.biddingExpiresAt.toISOString(),
          sessionDate: gig.sessionDate.toISOString(),
          biddingAllowed: gig.biddingAllowed,
        };
      });
      return updatedGigs;
    } catch (error) {
      throw error;
    }
  }

  async getActiveGigsOfInstructor(userId: string): Promise<GigDocument[]> {
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
