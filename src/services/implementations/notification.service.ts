import { ObjectId } from "mongoose";

import { redisPubSub } from "../../lib/redisPubSub";
import { INotificationService } from "../interfaces/notification-service.interface";
import { NotificationRepository } from "../../repositories/implementations/notification.repository";

export class NotificationService implements INotificationService  {
  constructor(private notificationRepository: NotificationRepository) {}

  async sendNotification(
    userId: string,
    type: "course" | "payment" | "message" | "system",
    title: string,
    message: string,
    entityId?: string
  ) {
    const notification = await this.notificationRepository.createNotification({
      userId: userId as unknown as ObjectId,
      type,
      title,
      message,
      entityId: entityId as unknown as ObjectId,
      isRead: false,
    });
    const notificationCount = await this.notificationRepository.countDocuments(
      userId
    );
    redisPubSub.pub.publish(
      `notifications:${userId}`,
      JSON.stringify({ notification:[notification], count: notificationCount })
    );
    return notification;
  }

  async getUserNotifications(userId: string) {
    return await this.notificationRepository.getUserUnreadNotifications(userId);
  }

  async markNotificationAsRead(notificationId: string) {
    return await this.notificationRepository.markAsRead(notificationId);
  }
}
