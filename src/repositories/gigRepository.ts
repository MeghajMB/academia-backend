import mongoose, { ClientSession } from "mongoose";
import { GigModel, IGigDocument } from "../models/gigModel";
import { DatabaseError } from "../errors/database-error";
import { StatusCode } from "../enums/statusCode.enum";
import { IGigRepository } from "./interfaces/IGigRepository";
import { BaseRepository } from "./base/baseRepository";
import { IGigWithInstructorData } from "../types/gig.interface.";

export class GigRepository
  extends BaseRepository<IGigDocument>
  implements IGigRepository
{
  constructor() {
    super(GigModel);
  }
  async createGig(gigData: Partial<IGigDocument>): Promise<IGigDocument> {
    try {
      const gig = new GigModel(gigData);
      return await gig.save();
    } catch (error: unknown) {
      throw new DatabaseError(
        "An unexpected database error occurred",
        StatusCode.INTERNAL_SERVER_ERROR
      );
    }
  }

  async updateCurrentBidderWithSession(
    gigId: string,
    bidderId: string,
    currentBid: number,
    session: ClientSession
  ): Promise<IGigDocument | null> {
    try {
      const updatedGig = await GigModel.findByIdAndUpdate(
        gigId,
        {
          currentBidder: bidderId,
          currentBid: currentBid,
        },
        { new: true, session: session }
      );
      return updatedGig;
    } catch (error: unknown) {
      throw new DatabaseError(
        "An unexpected database error occurred",
        StatusCode.INTERNAL_SERVER_ERROR
      );
    }
  }

  async findConflictingGig(
    instructorId: string,
    sessionDate: Date,
    sessionDuration: number
  ): Promise<IGigDocument | null> {
    try {
      const gigEndTime = new Date(
        sessionDate.getTime() + sessionDuration * 60000
      );

      const gig = await GigModel.findOne({
        instructorId: new mongoose.Types.ObjectId(instructorId),
        $or: [
          // New gig starts during an existing gig
          {
            sessionDate: { $gte: sessionDate, $lt: gigEndTime },
          },
          // New gig starts before an existing gig but overlaps
          {
            sessionDate: { $lte: sessionDate },
            $expr: {
              $gt: [
                {
                  $add: [
                    "$sessionDate",
                    { $multiply: ["$sessionDuration", 60000] },
                  ],
                },
                sessionDate,
              ],
            },
          },
        ],
      });
      return gig;
    } catch (error: unknown) {
      throw new DatabaseError(
        "An error occurred while checking for conflicting gigs",
        StatusCode.INTERNAL_SERVER_ERROR
      );
    }
  }

  async getActiveGigsWithPopulatedData(): Promise<IGigWithInstructorData[]> {
    try {
      const activeGigs = await GigModel.find({
        status: "active",
        biddingExpiresAt: { $gt: new Date() },
      }).populate("instructorId");
      return activeGigs as unknown as IGigWithInstructorData[];
    } catch (error: unknown) {
      throw new DatabaseError(
        "An error occurred while checking for conflicting gigs",
        StatusCode.INTERNAL_SERVER_ERROR
      );
    }
  }
  async getActiveGigsOfInstructor(userId: string): Promise<IGigDocument[]> {
    try {
      return await GigModel.find({ instructorId: userId, status: "active" });
    } catch (error: unknown) {
      throw new DatabaseError(
        "An error occurred while checking for conflicting gigs",
        StatusCode.INTERNAL_SERVER_ERROR
      );
    }
  }
}
