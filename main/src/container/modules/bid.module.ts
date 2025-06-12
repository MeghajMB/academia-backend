import { ContainerModule, ContainerModuleLoadOptions } from "inversify";
import { Types } from "../types";
import { IBidController } from "../../controllers/bid/bid.interface";
import { BidController } from "../../controllers/bid/bid.controller";
import { IBidService } from "../../services/bid/bid.interface";
import { BidService } from "../../services/bid/bid.service";
import { IBidRepository } from "../../repositories/bid/bid.interface";
import { BidRepository } from "../../repositories/bid/bid.repository";
import { BidDocument, BidModel } from "../../models/bid.model";
import { Model } from "mongoose";

export const bidModule: ContainerModule = new ContainerModule(
  (options: ContainerModuleLoadOptions) => {
    options
      .bind<IBidController>(Types.BidController)
      .to(BidController)
      .inSingletonScope();

    options
      .bind<IBidService>(Types.BidService)
      .to(BidService)
      .inSingletonScope();

    options
      .bind<IBidRepository>(Types.BidRepository)
      .to(BidRepository)
      .inSingletonScope();

    options
      .bind<Model<BidDocument>>(Types.BidModel)
      .toConstantValue(BidModel);
  }
);
