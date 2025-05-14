import { IRepository } from "../base/base.interface";
import { CoinDocument } from "../../models/coin.model";
import {
  createCoinPackageRequestDTO,
  updateCoinPackageRequestDTO,
  updateCoinRatioRequestDTO,
} from "../../controllers/coin/request.dto";
import { UpdateWriteOpResult } from "mongoose";
import { CreateCoinPackageRepository } from "./types";

export interface ICoinRepository extends IRepository<CoinDocument> {
  createPackage(
    payload: createCoinPackageRequestDTO
  ): Promise<CreateCoinPackageRepository>;
  updateCoinPackage(payload: updateCoinPackageRequestDTO): Promise<UpdateWriteOpResult> 
  updateCoinRatio(
    payload: updateCoinRatioRequestDTO
  ): Promise<UpdateWriteOpResult>;
  deleteCoinPackage(payload: string): Promise<UpdateWriteOpResult>;
}
