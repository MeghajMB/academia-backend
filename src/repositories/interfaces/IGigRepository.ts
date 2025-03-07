import mongoose from "mongoose";
import { IGigDocument } from "../../models/gigModel";
import { IRepository } from "../base/IRepositoryInterface";
import { IGigWithInstructorData } from "../../types/gig.interface.";

export interface IGigRepository extends IRepository<IGigDocument> {
  createGig(gigData: Partial<IGigDocument>): Promise<IGigDocument>;

  findConflictingGig(
    instructorId: string,
    serviceDate: Date,
    sessionDuration: number
  ): Promise<IGigDocument | null>;

  findGigById(id: string): Promise<IGigDocument | null>;

  updateGig(
    id: string,
    updateData: Partial<IGigDocument>
  ): Promise<IGigDocument | null>;

  deleteGig(id: string): Promise<IGigDocument | null>;

  getActiveGigsWithPopulatedData(): Promise<IGigWithInstructorData[]>;
}
