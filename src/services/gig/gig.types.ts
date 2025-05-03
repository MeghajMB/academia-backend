export interface CreateGigParams {
  title: string;
  description: string;
  minBid: number;
  biddingAllowed: boolean;
  sessionDuration: number;
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
    biddingExpiresAt: string;
    sessionDate: string;
  }

 export interface CreateGigServiceResponse {
    id: string;
    sessionDate: string; // ISO string
    description: string;
    biddingAllowed: boolean;
    sessionDuration: number;
    maxParticipants: number;
    minBid: number;
    status: "active" | "expired" | "completed" | "no-bids" | "missed";
    currentBid: number;
    title: string;
    instructorId: string;
    biddingExpiresAt: string; 
    createdAt: string; 
  };
  