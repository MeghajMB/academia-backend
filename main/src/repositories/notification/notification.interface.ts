import { NotificationDocument } from "../../models/notification.model";
import { IRepository } from "../base/base.interface";

export interface INotificationRepository
  extends IRepository<NotificationDocument> {}
