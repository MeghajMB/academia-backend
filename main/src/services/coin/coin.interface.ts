import {
  createCoinPackageRequestDTO,
  deleteCoinPackageRequestDTO,
  updateCoinPackageRequestDTO,
  updateCoinRatioRequestDTO,
} from "../../controllers/coin/request.dto";
import { CreatePackageServiceResponse } from "./coin.types";

export interface ICoinService {
  getAllPackages(): Promise<any>;
  getCoinConfig(): Promise<any>;
  createPackage(payload: createCoinPackageRequestDTO): Promise<CreatePackageServiceResponse>;
  updatePackage(payload: updateCoinPackageRequestDTO): Promise<{message:"success"}>;
  updateCoinRatio(payload: updateCoinRatioRequestDTO): Promise<void>;
  deleteCoinPackage(payload:deleteCoinPackageRequestDTO): Promise<void>;
}
