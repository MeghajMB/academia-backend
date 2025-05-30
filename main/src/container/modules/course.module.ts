import { ContainerModule, ContainerModuleLoadOptions } from "inversify";
import { Types } from "../types";
import { ICourseController } from "../../controllers/course/course.interface";
import { CourseController } from "../../controllers/course/course.controller";
import { ICourseService } from "../../services/course/course.interface";
import { CourseService } from "../../services/course/course.service";
import { ICourseRepository } from "../../repositories/course/course.interface";
import { CourseRepository } from "../../repositories/course/course.repository";
import { ISectionController } from "../../controllers/course/section/section.interface";
import { SectionController } from "../../controllers/course/section/section.controller";
import { ISectionRepository } from "../../repositories/course/section/section.interface";
import { ISectionService } from "../../services/course/section/section.interface";
import { SectionService } from "../../services/course/section/section.service";
import { SectionRepository } from "../../repositories/course/section/section.repository";
import { ILectureController } from "../../controllers/course/lecture/lecture.interface";
import { LectureController } from "../../controllers/course/lecture/lecture.controller";
import { ILectureService } from "../../services/course/lecture/lecture.interface";
import { LectureService } from "../../services/course/lecture/lecture.service";
import { ILectureRepository } from "../../repositories/course/lecture/lecture.interface";
import { LectureRepository } from "../../repositories/course/lecture/lecture.repository";
import { IEnrollmentRepository } from "../../repositories/enrollment/enrollment.interface";
import { EnrollmentRepository } from "../../repositories/enrollment/enrollment.repository";

export const courseModule: ContainerModule = new ContainerModule(
  (options: ContainerModuleLoadOptions) => {
    /* Course */

    options
      .bind<ICourseController>(Types.CourseController)
      .to(CourseController)
      .inSingletonScope();

    options
      .bind<ICourseService>(Types.CourseService)
      .to(CourseService)
      .inSingletonScope();

    options
      .bind<ICourseRepository>(Types.CourseRepository)
      .to(CourseRepository)
      .inSingletonScope();

    /* Section */

    options
      .bind<ISectionController>(Types.SectionController)
      .to(SectionController)
      .inSingletonScope();

    options
      .bind<ISectionService>(Types.SectionService)
      .to(SectionService)
      .inSingletonScope();

    options
      .bind<ISectionRepository>(Types.SectionRepository)
      .to(SectionRepository)
      .inSingletonScope();

    /* Lecture */

    options
      .bind<ILectureController>(Types.LectureController)
      .to(LectureController)
      .inSingletonScope();

    options
      .bind<ILectureService>(Types.LectureService)
      .to(LectureService)
      .inSingletonScope();

    options
      .bind<ILectureRepository>(Types.LectureRepository)
      .to(LectureRepository)
      .inSingletonScope();

    /* Enrollment */

    options
      .bind<IEnrollmentRepository>(Types.EnrollmentRepository)
      .to(EnrollmentRepository)
      .inSingletonScope();
  }
);
