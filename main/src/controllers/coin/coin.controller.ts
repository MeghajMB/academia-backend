import { NextFunction, Request, Response } from "express";
import { StatusCode } from "../../enums/status-code.enum";
import { ICoinController } from "./coin.interface";
import { ICoinService } from "../../services/coin/coin.interface";
import {
  CreateCoinPackageResponseSchema,
  GetCoinConfigResponseSchema,
  GetPackagesResponseSchema,
  NullResponseSchema,
} from "@academia-dev/common";
import {
  createCoinPackageRequestSchema,
  deleteCoinPackageRequestSchema,
  updateCoinPackageRequestSchema,
  updateCoinRatioRequestSchema,
} from "./request.dto";
import { inject, injectable } from "inversify";
import { Types } from "../../container/types";

@injectable()
export class CoinController implements ICoinController {
  constructor(
    @inject(Types.CoinService) private readonly coinService: ICoinService
  ) {}

  async getPackages(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await this.coinService.getAllPackages();
      const response = GetPackagesResponseSchema.parse({
        status: "success",
        code: StatusCode.OK,
        message: "success",
        data: result,
      });
      res.status(StatusCode.OK).send(response);
    } catch (error) {
      next(error);
    }
  }
  async getCoinConfig(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await this.coinService.getCoinConfig();
      const response = GetCoinConfigResponseSchema.parse({
        status: "success",
        code: StatusCode.OK,
        message: "success",
        data: result,
      });
      res.status(StatusCode.OK).send(response);
    } catch (error) {
      next(error);
    }
  }

  async createCoinPackage(req: Request, res: Response, next: NextFunction) {
    try {
      const payload = createCoinPackageRequestSchema.parse(req.body);
      const result = await this.coinService.createPackage(payload);
      const response = CreateCoinPackageResponseSchema.parse({
        status: "success",
        code: StatusCode.OK,
        message: "success",
        data: result,
      });
      res.status(StatusCode.OK).send(response);
    } catch (error) {
      next(error);
    }
  }

  async updateCoinPackage(req: Request, res: Response, next: NextFunction) {
    try {
      const payload = updateCoinPackageRequestSchema.parse({
        ...req.body,
        ...req.params,
      });
      const result = await this.coinService.updatePackage(payload);
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

  async deleteCoinPackage(req: Request, res: Response, next: NextFunction) {
    try {
      const payload = deleteCoinPackageRequestSchema.parse(req.params);
      const result = await this.coinService.deleteCoinPackage(payload);
      const response = NullResponseSchema.parse({
        status: "success",
        code: StatusCode.OK,
        message: "Coin ratio updated successfully",
        data: null,
      });
      res.status(response.code).send(response);
    } catch (error) {
      next(error);
    }
  }

  async updateCoinRatio(req: Request, res: Response, next: NextFunction) {
    try {
      const payload = updateCoinRatioRequestSchema.parse(req.body);
      await this.coinService.updateCoinRatio(payload);

      const response = NullResponseSchema.parse({
        status: "success",
        code: StatusCode.OK,
        message: "Coin ratio updated successfully",
        data: null,
      });

      res.status(StatusCode.OK).send(response);
    } catch (error) {
      next(error);
    }
  }
}
