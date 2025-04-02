export interface CreateGigParams {
  title: string;
  description: string;
  minBid: number;
  biddingAllowed: boolean;
  sessionDuration: string;
  maxParticipants: number;
  sessionDate: string;
}

export interface GetActiveGigsResponse {
    id: string;
    instructorId: string;
    instructorName: string;
    instructorProfilePicture: string;
    title: string;
    sessionDuration: number;
    minBid: number;
    biddingExpiresAt: Date;
    sessionDate: Date;
  }