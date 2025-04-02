import { StatusCode } from "../../enums/status-code.enum";
import {
  NotificationDocument,
  NotificationModel,
} from "../../models/notification.model";
import { DatabaseError } from "../../util/errors/database-error";
import { BaseRepository } from "../base/base.repository";
import { INotificationRepository } from "../interfaces/notification-repository.interface";

export class NotificationRepository
  extends BaseRepository<NotificationDocument>
  implements INotificationRepository
{
  constructor() {
    super(NotificationModel);
  }

  async getUserUnreadNotifications(userId: string):Promise<NotificationDocument[]> {
    try {
      return await NotificationModel.find({ userId, isRead: false })
        .sort({
          createdAt: -1,
        })
        .lean();
    } catch (error: unknown) {
      throw new DatabaseError(
        "An unexpected database error occurred",
        StatusCode.INTERNAL_SERVER_ERROR
      );
    }
  }
  async countUnreadNotifications(userId: string) {
    try {
      return await NotificationModel.countDocuments({ userId, isRead: false });
    } catch (error: unknown) {
      throw new DatabaseError(
        "An unexpected database error occurred",
        StatusCode.INTERNAL_SERVER_ERROR
      );
    }
  }

  async markAsRead(notificationId: string) {
    try {
      return await NotificationModel.findByIdAndUpdate(
        notificationId,
        { isRead: true },
        { new: true }
      );
    } catch (error: unknown) {
      throw new DatabaseError(
        "An unexpected database error occurred",
        StatusCode.INTERNAL_SERVER_ERROR
      );
    }
  }
}
