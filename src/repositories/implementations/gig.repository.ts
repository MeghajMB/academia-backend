import mongoose, { ClientSession } from "mongoose";
import { BaseRepository } from "../base/base.repository";
import { GigModel, GigDocument } from "../../models/gig.model";
import { IGigRepository } from "../interfaces/gig-repository.interface";
import { DatabaseError } from "../../util/errors/database-error";
import { StatusCode } from "../../enums/status-code.enum";
import { GigWithInstructorData } from "../types/gig-repository.types";


export class GigRepository
  extends BaseRepository<GigDocument>
  implements IGigRepository
{
  constructor() {
    super(GigModel);
  }

  async updateCurrentBidderWithSession(
    gigId: string,
    bidderId: string,
    currentBid: number,
    session: ClientSession
  ): Promise<GigDocument | null> {
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
  ): Promise<GigDocument | null> {
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
      }).lean();
      return gig;
    } catch (error: unknown) {
      throw new DatabaseError(
        "An error occurred while checking for conflicting gigs",
        StatusCode.INTERNAL_SERVER_ERROR
      );
    }
  }

  async getActiveGigsWithPopulatedData(): Promise<GigWithInstructorData[]> {
    try {
      const activeGigs = await GigModel.find({
        status: "active",
        biddingExpiresAt: { $gt: new Date() },
      }).populate("instructorId");
      return activeGigs as unknown as GigWithInstructorData[];
    } catch (error: unknown) {
      throw new DatabaseError(
        "An error occurred while checking for conflicting gigs",
        StatusCode.INTERNAL_SERVER_ERROR
      );
    }
  }
  async getActiveGigsOfInstructor(userId: string): Promise<GigDocument[]> {
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
