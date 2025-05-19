import { Request, Response, NextFunction } from "express";
import { NotificationService } from "../../services/notification/notification.service";
import { StatusCode } from "../../enums/status-code.enum";
import {
  GetUserNotificationsResponseSchema,
  MarkNotificationAsReadResponseSchema,
  NullResponseSchema,
  SendNotificationResponseSchema,
} from "@academia-dev/common";
import {
  GetUserNotificationsRequestSchema,
  MarkNotificationAsReadRequestSchema,
  SendNotificationRequestSchema,
} from "./request.dto";
import { INotificationController } from "./notification.interface";
import { inject, injectable } from "inversify";
import { Types } from "../../container/types";

@injectable()
export class NotificationController implements INotificationController {
  constructor(
    @inject(Types.NotificationService)
    private readonly notificationService: NotificationService
  ) {}

  async sendNotification(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId, type, title, message, entityId } =
        SendNotificationRequestSchema.parse(req.body);
      const notification = await this.notificationService.sendNotification(
        userId,
        type,
        title,
        message,
        entityId
      );
      const response = SendNotificationResponseSchema.parse({
        status: "success",
        code: StatusCode.CREATED,
        message: "Notification sent successfully",
        data: notification,
      });
      res.status(response.code).json(response);
    } catch (error) {
      next(error);
    }
  }

  async getUserNotifications(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId } = GetUserNotificationsRequestSchema.parse(req.params);
      const { id, role } = req.verifiedUser!;

      const notifications = await this.notificationService.getUserNotifications(
        id
      );
      const response = GetUserNotificationsResponseSchema.parse({
        status: "success",
        code: StatusCode.OK,
        message: "User notifications retrieved successfully",
        data: notifications,
      });
      res.status(response.code).json(response);
    } catch (error) {
      next(error);
    }
  }

  async markNotificationAsRead(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { notificationId } = MarkNotificationAsReadRequestSchema.parse(
        req.params
      );
      const updatedNotification =
        await this.notificationService.markNotificationAsRead(notificationId);
      const response = NullResponseSchema.parse({
        status: "success",
        code: StatusCode.OK,
        message: "Notification marked as read",
        data: null,
      });
      res.status(response.code).json(response);
    } catch (error) {
      next(error);
    }
  }
  async markAllNotificationAsRead(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const userId = req.verifiedUser?.id;
      const updatedNotification =
        await this.notificationService.markAllNotificationAsRead(userId!);
      const response = NullResponseSchema.parse({
        status: "success",
        code: StatusCode.OK,
        message: "All notification marked as read",
        data: null,
      });
      console.log(response);
      res.status(response.code).json(response);
    } catch (error) {
      next(error);
    }
  }
}
