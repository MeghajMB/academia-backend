import { GigDocument } from "../../models/gig.model";
import {
  CreateGigParams,
  GetActiveGigsResponse,
} from "../types/gig-service.types";

export interface IGigService {
  createGig(
    gigData: CreateGigParams,
    instructorId: string
  ): Promise<GigDocument>;

  getGigById(id: string): Promise<GigDocument | null>;

  updateGig(
    id: string,
    updateData: Partial<GigDocument>
  ): Promise<GigDocument | null>;

  deleteGig(id: string): Promise<void>;

  getActiveGigs(): Promise<GetActiveGigsResponse[]>;

  getActiveGigsOfInstructor(userId: string): Promise<GigDocument[]>;
}
