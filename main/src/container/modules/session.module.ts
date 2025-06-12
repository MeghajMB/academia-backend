import { ContainerModule, ContainerModuleLoadOptions } from "inversify";
import { Types } from "../types";
import { ISessionController } from "../../controllers/session/session.interface";
import { SessionController } from "../../controllers/session/session.controller";
import { ISessionService } from "../../services/session/session.interface";
import { SessionService } from "../../services/session/session.service";
import { ISessionRepository } from "../../repositories/session/session.interface";
import { SessionRepository } from "../../repositories/session/session.repository";
import { Model } from "mongoose";
import { SessionDocument, SessionModel } from "../../models/session.model";

export const sessionModule: ContainerModule = new ContainerModule(
  (options: ContainerModuleLoadOptions) => {
    options
      .bind<ISessionController>(Types.SessionController)
      .to(SessionController)
      .inSingletonScope();

    options
      .bind<ISessionService>(Types.SessionService)
      .to(SessionService)
      .inSingletonScope();

    options
      .bind<ISessionRepository>(Types.SessionRepository)
      .to(SessionRepository)
      .inSingletonScope();

    options
      .bind<Model<SessionDocument>>(Types.SessionModel)
      .toConstantValue(SessionModel);
  }
);
