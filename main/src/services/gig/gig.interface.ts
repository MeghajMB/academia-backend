import { GigDocument } from "../../models/gig.model";
import {
  CreateGigParams,
  CreateGigServiceResponse,
  GetActiveGigsResponse,
  UpdateGigServiceParams,
} from "./gig.types";

export interface IGigService {
  createGig(
    gigData: CreateGigParams,
    instructorId: string
  ): Promise<CreateGigServiceResponse>;

  getGigById(id: string): Promise<{
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
  } | null>;

  updateGig(
    id: string,
    updateData: UpdateGigServiceParams
  ): Promise<GigDocument | null>;
  getAllGigsOfInstructor(
    payload: {
      limit: number;
      status?: "active" | "expired" | "completed" | "no-bids" | "missed";
      sort?: string;
      page?: string;
      search?: string;
    },
    userId: string
  ): Promise<any>;
  deleteGig(id: string): Promise<void>;

  getActiveGigs(): Promise<GetActiveGigsResponse[]>;

  getActiveGigsOfInstructor(userId: string): Promise<GigDocument[]>;
}
