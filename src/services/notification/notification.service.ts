import { Types } from "mongoose";
import { redisPubSub } from "../../lib/redisPubSub";
import { INotificationService } from "./notification.interface";
import { NotificationRepository } from "../../repositories/notification/notification.repository";
import { NotificationDocument } from "../../models/notification.model";
import { GetUserNotificationResponse } from "./notification.types";

export class NotificationService implements INotificationService {
  constructor(private readonly notificationRepository: NotificationRepository) {}

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

      redisPubSub.pub.publish(
        `notifications:${userId}`,
        JSON.stringify({
          notification: notification,
        })
      );
      return notification;
    } catch (error) {
      throw error;
    }
  }

  async getUserNotifications(
    userId: string
  ): Promise<GetUserNotificationResponse[]> {
    try {
      const unreadNotifications =
        await this.notificationRepository.getUserUnreadNotifications(userId);
      const updatedNotifications = unreadNotifications.map((notification) => {
        return {
          id: notification._id.toString(),
          userId: notification.userId.toString(),
          type: notification.type,
          title: notification.title,
          message: notification.message,
          entityId: notification.entityId?.toString(),
          isRead: notification.isRead,
          createdAt: notification.createdAt.toISOString(),
        };
      });
      return updatedNotifications;
    } catch (error) {
      throw error;
    }
  }

  async markNotificationAsRead(
    notificationId: string
  ): Promise<{ message: "success" }> {
    try {
      const result = await this.notificationRepository.markAsRead(
        notificationId
      );
      return { message: "success" };
    } catch (error) {
      throw error;
    }
  }
  async markAllNotificationAsRead(
    userID: string
  ): Promise<{ message: "success" }> {
    try {
      const result = await this.notificationRepository.markAllAsRead(userID);
      return { message: "success" };
    } catch (error) {
      throw error;
    }
  }
}
