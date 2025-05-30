import { ContainerModule, ContainerModuleLoadOptions } from "inversify";
import { Types } from "../types";
import { IInstructorController } from "../../controllers/instructor/instructor.interface";
import { InstructorController } from "../../controllers/instructor/instructor.controller";
import { IInstructorService } from "../../services/instructor/instructor.interface";
import { InstructorService } from "../../services/instructor/instructor.service";

export const instructorModule: ContainerModule = new ContainerModule(
  (options: ContainerModuleLoadOptions) => {
    options
      .bind<IInstructorController>(Types.InstructorController)
      .to(InstructorController)
      .inSingletonScope();

    options
      .bind<IInstructorService>(Types.InstructorService)
      .to(InstructorService)
      .inSingletonScope();
  }
);
