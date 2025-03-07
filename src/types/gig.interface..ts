import { IGigDocument } from "../models/gigModel";
import { IUserResult } from "./user.interface";

export interface ICreateGigDTO {
    title: string;
    description: string;
    minBid: number;
    biddingAllowed: boolean;
    sessionDuration: string;
    maxParticipants: number;
    serviceDate: string; // Received as a string
  }

  export interface IGigWithInstructorData extends Omit<IGigDocument, "instructorId">{
    instructorId:IUserResult
  }
  
  export interface IActiveGig {
    id: string;
    instructorId: string;
    instructorName: string;
    instructorProfilePicture: string;
    title: string;
    sessionDuration: number;
    minBid: number;
    biddingExpiresAt: Date;
    serviceDate: Date;
  }
  