import { ContainerModule, ContainerModuleLoadOptions } from "inversify";
import { Types } from "../types";
import { ICoinController } from "../../controllers/coin/coin.interface";
import { CoinController } from "../../controllers/coin/coin.controller";
import { ICoinService } from "../../services/coin/coin.interface";
import { CoinService } from "../../services/coin/coin.service";
import { CoinRepository } from "../../repositories/coin/coin.repository";

export const coinModule: ContainerModule = new ContainerModule(
  (options: ContainerModuleLoadOptions) => {
    options
      .bind<ICoinController>(Types.CoinController)
      .to(CoinController)
      .inSingletonScope();

    options
      .bind<ICoinService>(Types.CoinService)
      .to(CoinService)
      .inSingletonScope();

    options
      .bind<CoinRepository>(Types.CoinRepository)
      .to(CoinRepository)
      .inSingletonScope();
  }
);
