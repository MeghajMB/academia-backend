import { inject, injectable } from "inversify";
import {
  createCoinPackageRequestDTO,
  deleteCoinPackageRequestDTO,
  updateCoinPackageRequestDTO,
  updateCoinRatioRequestDTO,
} from "../../controllers/coin/request.dto";
import { ICoinRepository } from "../../repositories/coin/coin.interface";
import { ICoinService } from "./coin.interface";
import { CreatePackageServiceResponse } from "./coin.types";
import { Types } from "../../container/types";

@injectable()
export class CoinService implements ICoinService {
  constructor(
    @inject(Types.CoinRepository)
    private readonly coinRepository: ICoinRepository
  ) {}
  async updatePackage(
    payload: updateCoinPackageRequestDTO
  ): Promise<{ message: "success" }> {
    try {
      const response = await this.coinRepository.updateCoinPackage(payload);
      return { message: "success" };
    } catch (error) {
      throw error;
    }
  }
  async deleteCoinPackage(payload: deleteCoinPackageRequestDTO): Promise<void> {
    try {
      await this.coinRepository.deleteCoinPackage(payload.packageId);
    } catch (error) {
      throw error;
    }
  }

  async getAllPackages(): Promise<any> {
    try {
      const coinPackages = await this.coinRepository.findAll();
      const updatedCoinPackages = {
        id: coinPackages[0]._id.toString(),
        packages: coinPackages[0].purchasePackages.map((purchasePackage) => {
          return {
            id: purchasePackage._id.toString(),
            coinAmount: purchasePackage.coinAmount,
            priceInINR: purchasePackage.priceInINR,
          };
        }),
      };
      return updatedCoinPackages;
    } catch (error) {
      throw error;
    }
  }

  async getCoinConfig(): Promise<any> {
    try {
      const coinConfig = await this.coinRepository.findAll();
      const updatedcoinConfig = {
        id: coinConfig[0]._id.toString(),
        packages: coinConfig[0].purchasePackages.map((purchasePackage) => {
          return {
            id: purchasePackage._id.toString(),
            coinAmount: purchasePackage.coinAmount,
            priceInINR: purchasePackage.priceInINR,
          };
        }),
        goldToINRRatio: coinConfig[0].goldToINRRatio,
        redeemPointsToGoldRatio: coinConfig[0].redeemPointsToGoldRatio,
        isActive: coinConfig[0].isActive,
      };
      return updatedcoinConfig;
    } catch (error) {
      throw error;
    }
  }

  async createPackage(
    payload: createCoinPackageRequestDTO
  ): Promise<CreatePackageServiceResponse> {
    try {
      const coinPackage = await this.coinRepository.createPackage(payload);
      const updatedCoinPackage = {
        id: coinPackage._id.toString(),
        coinAmount: coinPackage.coinAmount,
        priceInINR: coinPackage.priceInINR,
      };
      return updatedCoinPackage;
    } catch (error) {
      throw error;
    }
  }

  async updateCoinRatio(payload: updateCoinRatioRequestDTO): Promise<void> {
    try {
      await this.coinRepository.updateCoinRatio(payload);
    } catch (error) {
      throw error;
    }
  }
}
