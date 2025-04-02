import { GigDocument } from "../../models/gig.model";
import { IUserResult } from "./user-repository.types";

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
