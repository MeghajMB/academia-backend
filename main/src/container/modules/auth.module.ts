import { ContainerModule, ContainerModuleLoadOptions } from "inversify";
import { Types } from "../types";
import { IAuthController } from "../../controllers/auth/auth.interface";
import { AuthController } from "../../controllers/auth/auth.controller";
import { IAuthService } from "../../services/auth/auth.interface";
import { AuthService } from "../../services/auth/auth.service";

export const authModule: ContainerModule = new ContainerModule(
  (options: ContainerModuleLoadOptions) => {
    options
      .bind<IAuthController>(Types.AuthController)
      .to(AuthController)
      .inSingletonScope();

    options
      .bind<IAuthService>(Types.AuthService)
      .to(AuthService)
      .inSingletonScope();
  }
);
