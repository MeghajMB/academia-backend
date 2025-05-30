import { ContainerModule, ContainerModuleLoadOptions } from "inversify";
import { Types } from "../types";
import { IAdminService } from "../../services/admin/admin.interface";
import { AdminService } from "../../services/admin/admin.service";
import { IAdminController } from "../../controllers/admin/admin.interface";
import { AdminController } from "../../controllers/admin/admin.controller";

export const adminModule: ContainerModule = new ContainerModule(
  (options: ContainerModuleLoadOptions) => {
    options
      .bind<IAdminController>(Types.AdminController)
      .to(AdminController)
      .inSingletonScope();

    options
      .bind<IAdminService>(Types.AdminService)
      .to(AdminService)
      .inSingletonScope();
  }
);
