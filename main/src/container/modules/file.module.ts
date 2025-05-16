import { ContainerModule, ContainerModuleLoadOptions } from "inversify";
import { Types } from "../types";
import { IFileController } from "../../controllers/file/file.interface";
import { FileController } from "../../controllers/file/file.controller";
import { IFileService } from "../../services/file/file.interface";
import { FileService } from "../../services/file/file.service";

export const fileModule: ContainerModule = new ContainerModule(
  (options: ContainerModuleLoadOptions) => {
    options
      .bind<IFileController>(Types.FileController)
      .to(FileController)
      .inSingletonScope();

    options
      .bind<IFileService>(Types.FileService)
      .to(FileService)
      .inSingletonScope();
  }
);
