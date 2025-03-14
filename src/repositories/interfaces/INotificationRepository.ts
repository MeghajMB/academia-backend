import { INotificationDocument } from "../../models/notificationModel";

export interface INotificationRepository {
  createNotification(userId: string, message: string): Promise<INotificationDocument>;
  findByUserId(userId: string): Promise<INotificationDocument[]>;
}