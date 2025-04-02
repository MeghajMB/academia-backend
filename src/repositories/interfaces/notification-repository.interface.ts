import { NotificationDocument } from "../../models/notification.model";
import { IRepository } from "../base/base-repository.interface";

export interface INotificationRepository
  extends IRepository<NotificationDocument> {}
