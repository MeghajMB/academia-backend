import { INotificationDocument } from "../../models/notification.model";

export interface INotificationRepository {
  createNotification(userId: string, message: string): Promise<INotificationDocument>;
  findByUserId(userId: string): Promise<INotificationDocument[]>;
}