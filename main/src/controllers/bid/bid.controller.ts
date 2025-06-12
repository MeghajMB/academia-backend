import { NextFunction, Request, Response } from "express";
import { StatusCode } from "../../enums/status-code.enum";
import {
  GetBidByIdResponseSchema,
  GetBidsForGigResponseSchema,
  NullResponseSchema,
} from "@academia-dev/common";
import {
  GetBidByIdRequestSchema,
  GetBidsForGigRequestSchema,
  PlaceBidRequestSchema,
} from "./request.dto";
import { inject, injectable } from "inversify";
import { Types } from "../../container/types";
import { IBidService } from "../../services/bid/bid.interface";

@injectable()
export class BidController {
  constructor(
    @inject(Types.BidService) private readonly bidService: IBidService
  ) {}

  async placeBid(req: Request, res: Response, next: NextFunction) {
    try {
      const { gigId, bidAmt } = PlaceBidRequestSchema.parse(req.body);
      const id = req.verifiedUser!.id;
      const bid = await this.bidService.placeBid({ gigId, bidAmt }, id);
      const response = NullResponseSchema.parse({
        status: "success",
        code: StatusCode.OK,
        message: "success",
        data: null,
      });
      res.status(StatusCode.OK).send(response);
    } catch (error) {
      next(error);
    }
  }

  async getBidById(req: Request, res: Response, next: NextFunction) {
    try {
      const { bidId } = GetBidByIdRequestSchema.parse(req.params);
      const result = await this.bidService.getBidById(bidId);
      const response = GetBidByIdResponseSchema.parse({
        status: "success",
        code: StatusCode.OK,
        message: "Bid retrieved successfully",
        data: result,
      });
      res.status(StatusCode.OK).json(response);
    } catch (error) {
      next(error);
    }
  }

  async getBidsForGig(req: Request, res: Response, next: NextFunction) {
    try {
      const { gigId } = GetBidsForGigRequestSchema.parse(req.params);
      const bids = await this.bidService.getBidsForGig(gigId);
      const response = GetBidsForGigResponseSchema.parse({
        status: "success",
        code: StatusCode.OK,
        message: "Bids retrieved successfully",
        data: bids,
      });
      res.status(StatusCode.OK).json(response);
    } catch (error) {
      next(error);
    }
  }
}
