import { ContainerModule, ContainerModuleLoadOptions } from "inversify";
import { Types } from "../types";
import { IUserController } from "../../controllers/user/user.interface";
import { UserController } from "../../controllers/user/user.controller";
import { IUserService } from "../../services/user/user.interface";
import { UserService } from "../../services/user/user.service";
import { IUserRepository } from "../../repositories/user/user.interface";
import { UserRepository } from "../../repositories/user/user.repository";
import { Model } from "mongoose";
import { UserDocument, UserModel } from "../../models/user.model";

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
      .bind<IUserRepository>(Types.UserRepository)
      .to(UserRepository)
      .inSingletonScope();

    options
      .bind<Model<UserDocument>>(Types.UserModel)
      .toConstantValue(UserModel);
  }
);
