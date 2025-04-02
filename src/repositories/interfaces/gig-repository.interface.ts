import mongoose, { ClientSession } from "mongoose";
import { GigDocument } from "../../models/gig.model";
import { IRepository } from "../base/base-repository.interface";
import { GigWithInstructorData } from "../types/gig-repository.types";

export interface IGigRepository extends IRepository<GigDocument> {
  findConflictingGig(
    instructorId: string,
    sessionDate: Date,
    sessionDuration: number
  ): Promise<GigDocument | null>;
  updateCurrentBidderWithSession(
    gigId: string,
    bidderId: string,
    currentBid: number,
    session: ClientSession
  ): Promise<GigDocument | null>;
  getActiveGigsWithPopulatedData(): Promise<GigWithInstructorData[]>;
  getActiveGigsOfInstructor(userId: string): Promise<GigDocument[]>;
}
