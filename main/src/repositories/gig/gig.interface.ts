import mongoose, { ClientSession } from "mongoose";
import { GigDocument } from "../../models/gig.model";
import { IRepository } from "../base/base.interface";
import {
  AggregatedGigEarnings,
  getGigMetricsRepositoryResponse,
  GigWithInstructorData,
} from "./gig.types";

export interface IGigRepository extends IRepository<GigDocument> {
  getGigEarnings(
    userId: string,
    filter: "quarter" | "month" | "year",
    start: Date,
    end: Date
  ): Promise<AggregatedGigEarnings[]|[]>;
  getGigMetrics(
    userId: string
  ): Promise<getGigMetricsRepositoryResponse[] | []>;
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
