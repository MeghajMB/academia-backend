import { ContainerModule, ContainerModuleLoadOptions } from "inversify";
import { Types } from "../types";
import { ISessionController } from "../../controllers/session/session.interface";
import { SessionController } from "../../controllers/session/session.controller";
import { ISessionService } from "../../services/session/session.interface";
import { SessionService } from "../../services/session/session.service";
import { ISessionRepository } from "../../repositories/session/session.interface";
import { SessionRepository } from "../../repositories/session/session.repository";
import { IUserController } from "../../controllers/user/user.interface";
import { UserController } from "../../controllers/user/user.controller";
import { IUserService } from "../../services/user/user.interface";
import { UserService } from "../../services/user/user.service";
import { IUserRepository } from "../../repositories/user/user.interface";
import { UserRepository } from "../../repositories/user/user.repository";

export const userModule: ContainerModule = new ContainerModule(
  (options: ContainerModuleLoadOptions) => {
    options
      .bind<IUserController>(Types.UserController)
      .to(UserController)
      .inSingletonScope();

    options
      .bind<IUserService>(Types.UserService)
      .to(UserService)
      .inSingletonScope();

    options
      .bind<IUserRepository>(Types.userRepository)
      .to(UserRepository)
      .inSingletonScope();
  }
);
