import { NextFunction, Request, Response } from "express";
import { BidService } from "../services/bidService";
import { StatusCode } from "../enums/statusCode.enum";
import { BadRequestError } from "../errors/bad-request-error";
export class BidController {
  constructor(private bidService: BidService) {}

  async placeBid(req: Request, res: Response, next: NextFunction) {
    try {
      const { gigId, bidAmt } = req.body;
      const id = req.verifiedUser!.id;
      if (!gigId || !bidAmt) {
        throw new BadRequestError("Must have all data");
      }
      const bid = await this.bidService.placeBid(
        { gigId, bidAmt: Number(bidAmt) },
        id
      );
      res.status(200).send({ message: "success" });
    } catch (error) {
      next(error);
    }
  }

  async getBidById(req: Request, res: Response, next: NextFunction) {
    try {
      const bid = await this.bidService.getBidById(req.params.id);
      res.status(StatusCode.OK).json(bid);
    } catch (error) {
      next(error);
    }
  }

  async getBidsForGig(req: Request, res: Response, next: NextFunction) {
    try {
      const bids = await this.bidService.getBidsForGig(req.params.gigId);
      res.status(StatusCode.OK).json(bids);
    } catch (error) {
      next(error);
    }
  }

  async updateBid(req: Request, res: Response, next: NextFunction) {
    try {
      const updatedBid = await this.bidService.updateBid(
        req.params.id,
        req.body
      );
      res.status(StatusCode.OK).json(updatedBid);
    } catch (error) {
      next(error);
    }
  }

  async deleteBid(req: Request, res: Response, next: NextFunction) {
    try {
      await this.bidService.deleteBid(req.params.id);
      res.status(StatusCode.NO_CONTENT).send();
    } catch (error) {
      next(error);
    }
  }
}
