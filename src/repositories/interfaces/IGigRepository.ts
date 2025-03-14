import mongoose from "mongoose";
import { IGigDocument } from "../../models/gigModel";
import { IRepository } from "../base/IRepositoryInterface";
import { IGigWithInstructorData } from "../../types/gig.interface.";

export interface IGigRepository extends IRepository<IGigDocument> {
  createGig(gigData: Partial<IGigDocument>): Promise<IGigDocument>;

  findConflictingGig(
    instructorId: string,
    sessionDate: Date,
    sessionDuration: number
  ): Promise<IGigDocument | null>;



  getActiveGigsWithPopulatedData(): Promise<IGigWithInstructorData[]>;
}
