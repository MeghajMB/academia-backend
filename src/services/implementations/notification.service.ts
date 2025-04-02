import { Types } from "mongoose";
import { redisPubSub } from "../../lib/redisPubSub";
import { INotificationService } from "../interfaces/notification-service.interface";
import { NotificationRepository } from "../../repositories/implementations/notification.repository";
import { NotificationDocument } from "../../models/notification.model";

export class NotificationService implements INotificationService {
  constructor(private notificationRepository: NotificationRepository) {}

  async sendNotification(
    userId: string,
    type: "course" | "payment" | "message" | "system",
    title: string,
    message: string,
    entityId?: string
  ): Promise<NotificationDocument> {
    try {
      const notification = await this.notificationRepository.create({
        userId: new Types.ObjectId(userId),
        type,
        title,
        message,
        entityId: new Types.ObjectId(entityId),
        isRead: false,
      });
      const notificationCount =
        await this.notificationRepository.countUnreadNotifications(userId);
      redisPubSub.pub.publish(
        `notifications:${userId}`,
        JSON.stringify({
          notification: [notification],
          count: notificationCount,
        })
      );
      return notification;
    } catch (error) {
      throw error;
    }
  }

  async getUserNotifications(userId: string): Promise<NotificationDocument[]> {
    try {
      const unreadNotifications =
        await this.notificationRepository.getUserUnreadNotifications(userId);
      return unreadNotifications;
    } catch (error) {
      throw error;
    }
  }

  async markNotificationAsRead(notificationId: string):Promise<{message:"success"}> {
    try {
      const result = await this.notificationRepository.markAsRead(
        notificationId
      );
      return { message: "success" };
    } catch (error) {
      throw error;
    }
  }
}
