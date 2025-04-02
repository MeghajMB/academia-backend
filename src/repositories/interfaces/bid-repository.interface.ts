import { BidDocument } from "../../models/bid.model";
import { IRepository } from "../base/base-repository.interface";

export interface IBidRepository extends IRepository<BidDocument> {}
