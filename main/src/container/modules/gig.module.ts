import { ContainerModule, ContainerModuleLoadOptions } from "inversify";
import { Types } from "../types";
import { IGigController } from "../../controllers/gig/gig.interface";
import { GigController } from "../../controllers/gig/gig.controller";
import { IGigService } from "../../services/gig/gig.interface";
import { GigService } from "../../services/gig/gig.service";
import { IGigRepository } from "../../repositories/gig/gig.interface";
import { GigRepository } from "../../repositories/gig/gig.repository";

export const gigModule: ContainerModule = new ContainerModule(
  (options: ContainerModuleLoadOptions) => {
    options
      .bind<IGigController>(Types.GigController)
      .to(GigController)
      .inSingletonScope();

    options
      .bind<IGigService>(Types.GigService)
      .to(GigService)
      .inSingletonScope();

    options
      .bind<IGigRepository>(Types.GigRepository)
      .to(GigRepository)
      .inSingletonScope();
  }
);
