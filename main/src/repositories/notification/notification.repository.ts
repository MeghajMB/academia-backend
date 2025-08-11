import { inject, injectable } from "inversify";
import { StatusCode } from "../../enums/status-code.enum";
import { NotificationDocument } from "../../models/notification.model";
import { DatabaseError } from "../../util/errors/database-error";
import { BaseRepository } from "../base/base.repository";
import { INotificationRepository } from "./notification.interface";
import { Types } from "../../container/types";
import { Model } from "mongoose";

@injectable()
export class NotificationRepository
  extends BaseRepository<NotificationDocument>
  implements INotificationRepository
{
  constructor(
    @inject(Types.NotificationModel)
    private readonly notificationModel: Model<NotificationDocument>
  ) {
    super(notificationModel);
  }

  async getUserUnreadNotifications(
    userId: string
  ): Promise<NotificationDocument[]> {
    try {
      return await this.notificationModel
        .find({ userId, isRead: false })
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
      return await this.notificationModel.countDocuments({
        userId,
        isRead: false,
      });
    } catch (error: unknown) {
      throw new DatabaseError(
        "An unexpected database error occurred",
        StatusCode.INTERNAL_SERVER_ERROR
      );
    }
  }

  async markAsRead(notificationId: string) {
    try {
      return await this.notificationModel.findByIdAndUpdate(
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
  async markAllAsRead(userId: string) {
    try {
      const result = await this.notificationModel.updateMany(
        { userId },
        { $set: { isRead: true } }
      );
      console.log(result);
      return result;
    } catch (error: unknown) {
      throw new DatabaseError(
        "An unexpected database error occurred",
        StatusCode.INTERNAL_SERVER_ERROR
      );
    }
  }
}
