import { ContainerModule, ContainerModuleLoadOptions } from "inversify";
import { Types } from "../types";
import { ICategoryController } from "../../controllers/category/category.interface";
import { CategoryController } from "../../controllers/category/category.controller";
import { ICategoryService } from "../../services/category/category.interface";
import { CategoryService } from "../../services/category/category.service";
import { ICategoryRepository } from "../../repositories/category/category.interface";
import { CategoryRepository } from "../../repositories/category/category.repository";

export const categoryModule: ContainerModule = new ContainerModule(
  (options: ContainerModuleLoadOptions) => {
    options
      .bind<ICategoryController>(Types.CategoryController)
      .to(CategoryController)
      .inSingletonScope();

    options
      .bind<ICategoryService>(Types.CategoryService)
      .to(CategoryService)
      .inSingletonScope();

    options
      .bind<ICategoryRepository>(Types.CategoryRepository)
      .to(CategoryRepository)
      .inSingletonScope();
  }
);
