import { Types } from "mongoose";

export interface CreateCoinPackageRepository{
    _id: Types.ObjectId;
    coinAmount: number;
    priceInINR: number;
}