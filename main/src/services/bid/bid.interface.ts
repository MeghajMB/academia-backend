import { BidDocument } from "../../models/bid.model";

export interface IBidService {
  placeBid(
    bidData: { gigId: string; bidAmt: number },
    userId: string
  ): Promise<{message:"success"}>;
  createBid(
    bidData: { gigId: string; bidAmt: number },
    userId: string
  ): Promise<BidDocument>;

  getBidById(id: string): Promise<BidDocument | null>;

  getBidsForGig(gigId: string): Promise<BidDocument[]>;

  updateBid(
    id: string,
    updateData: Partial<BidDocument>
  ): Promise<BidDocument | null>;

  deleteBid(id: string): Promise<void>;
}
