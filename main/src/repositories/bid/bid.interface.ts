import { BidDocument } from "../../models/bid.model";
import { IRepository } from "../base/base.interface";

export interface IBidRepository extends IRepository<BidDocument> {}
