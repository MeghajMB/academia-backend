import { GigDocument } from "../../models/gig.model";
import { IUserResult } from "../user/user.types";

export interface CreateGigDTO {
  title: string;
  description: string;
  minBid: number;
  biddingAllowed: boolean;
  sessionDuration: string;
  maxParticipants: number;
  sessionDate: string; // Received as a string
}

export interface GigWithInstructorData
  extends Omit<GigDocument, "instructorId"> {
  instructorId: IUserResult;
}

export interface getGigMetricsRepositoryResponse {
  totalGigs: number;
  activeGigs: number;
  expiredGigs: number;
  completedGigs: number;
  missedGigs: number;
  noBidGigs: number;
  totalGigEarnings: number;
}

export interface AggregatedGigEarnings {
  _id: {
    year: number;
    month: number;
    quarter:number;
  };
  total: number;
};