import {
  NotificationModel,
  INotificationDocument,
} from "../models/notificationModel";

export class NotificationRepository {
  async createNotification(notificationData: Partial<INotificationDocument>) {
    return await NotificationModel.create(notificationData);
  }

  async getUserUnreadNotifications(userId: string) {
    return await NotificationModel.find({ userId,isRead:false }).sort({ createdAt: -1 });
  }
  async countDocuments(userId: string) {
    return await NotificationModel.countDocuments({ userId, isRead: false });
  }

  async markAsRead(notificationId: string) {
    return await NotificationModel.findByIdAndUpdate(
      notificationId,
      { isRead: true },
      { new: true }
    );
  }
}
