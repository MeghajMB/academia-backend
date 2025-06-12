import { StatusCode } from "../../enums/status-code.enum";
import { DatabaseError } from "../../util/errors/database-error";
import { BaseRepository } from "../base/base.repository";
import { CoinDocument } from "../../models/coin.model";
import { ICoinRepository } from "./coin.interface";
import {
  createCoinPackageRequestDTO,
  updateCoinPackageRequestDTO,
  updateCoinRatioRequestDTO,
} from "../../controllers/coin/request.dto";
import mongoose, { Model, UpdateWriteOpResult } from "mongoose";
import { CreateCoinPackageRepository } from "./types";
import { inject, injectable } from "inversify";
import { Types } from "../../container/types";

@injectable()
export class CoinRepository
  extends BaseRepository<CoinDocument>
  implements ICoinRepository
{
  constructor(
    @inject(Types.CoinModel) private readonly coinModel: Model<CoinDocument>
  ) {
    super(coinModel);
  }
  async deleteCoinPackage(id: string): Promise<UpdateWriteOpResult> {
    try {
      const result = await this.coinModel.updateOne(
        { isActive: true },
        {
          $pull: {
            purchasePackages: {
              _id: new mongoose.Types.ObjectId(id),
            },
          },
        }
      );

      return result;
    } catch (error) {
      console.log(error);
      throw new DatabaseError(
        "An unexpected database error occurred",
        StatusCode.INTERNAL_SERVER_ERROR
      );
    }
  }
  async createPackage(
    payload: createCoinPackageRequestDTO
  ): Promise<CreateCoinPackageRepository> {
    try {
      const newPackage = {
        ...payload,
        _id: new mongoose.Types.ObjectId(),
      };
      const result = await this.coinModel.updateOne(
        { isActive: true },
        { $push: { purchasePackages: newPackage } },
        { new: true }
      );
      return newPackage;
    } catch (error: unknown) {
      console.log(error);
      throw new DatabaseError(
        "An unexpected database error occurred",
        StatusCode.INTERNAL_SERVER_ERROR
      );
    }
  }

  async updateCoinPackage(
    payload: updateCoinPackageRequestDTO
  ): Promise<UpdateWriteOpResult> {
    try {
      const result = await this.coinModel.updateOne(
        { isActive: true },
        {
          $set: {
            "purchasePackages.$[pkg].coinAmount": payload.coinAmount,
            "purchasePackages.$[pkg].priceInINR": payload.priceInINR,
          },
        },
        {
          arrayFilters: [
            { "pkg._id": new mongoose.Types.ObjectId(payload.packageId) },
          ],
        }
      );

      return result;
    } catch (error) {
      console.error(error);
      throw new DatabaseError(
        "An unexpected database error occurred while updating coin package",
        StatusCode.INTERNAL_SERVER_ERROR
      );
    }
  }

  async updateCoinRatio(
    payload: updateCoinRatioRequestDTO
  ): Promise<UpdateWriteOpResult> {
    try {
      const updateFields: Record<string, any> = {};
      if (payload.goldToINRRatio !== undefined) {
        updateFields.goldToINRRatio = payload.goldToINRRatio;
      }
      if (payload.redeemPointsToGoldRatio !== undefined) {
        updateFields.redeemPointsToGoldRatio = payload.redeemPointsToGoldRatio;
      }

      const result = await this.coinModel.updateOne(
        { isActive: true },
        { $set: updateFields }
      );

      return result;
    } catch (error) {
      console.error(error);
      throw new DatabaseError(
        "An unexpected database error occurred while updating coin ratios",
        StatusCode.INTERNAL_SERVER_ERROR
      );
    }
  }
}
