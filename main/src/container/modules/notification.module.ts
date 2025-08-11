import { ContainerModule, ContainerModuleLoadOptions } from "inversify";
import { Types } from "../types";
import { INotificationController } from "../../controllers/notification/notification.interface";
import { NotificationController } from "../../controllers/notification/notification.controller";
import { INotificationService } from "../../services/notification/notification.interface";
import { NotificationService } from "../../services/notification/notification.service";
import { INotificationRepository } from "../../repositories/notification/notification.interface";
import { NotificationRepository } from "../../repositories/notification/notification.repository";
import { Model } from "mongoose";
import {
  NotificationDocument,
  NotificationModel,
} from "../../models/notification.model";

export const notificationModule: ContainerModule = new ContainerModule(
  (options: ContainerModuleLoadOptions) => {
    options
      .bind<INotificationController>(Types.NotificationController)
      .to(NotificationController)
      .inSingletonScope();

    options
      .bind<INotificationService>(Types.NotificationService)
      .to(NotificationService)
      .inSingletonScope();

    options
      .bind<INotificationRepository>(Types.NotificationRepository)
      .to(NotificationRepository)
      .inSingletonScope();

    options
      .bind<Model<NotificationDocument>>(Types.NotificationModel)
      .toConstantValue(NotificationModel);
  }
);
