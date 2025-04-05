import { Request, Response, NextFunction } from "express";
import { NotificationService } from "../../services/implementations/notification.service";
import { StatusCode } from "../../enums/status-code.enum";
import {
  GetUserNotificationsResponseSchema,
  MarkNotificationAsReadResponseSchema,
  SendNotificationResponseSchema,
} from "../dtos/notification/response.dto";
import {
  GetUserNotificationsRequestSchema,
  MarkNotificationAsReadRequestSchema,
  SendNotificationRequestSchema,
} from "../dtos/notification/request.dto";
import { INotificationController } from "../interfaces/notification-controller.interface";

export class NotificationController implements INotificationController {
  constructor(private notificationService: NotificationService) {}

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
      const response = MarkNotificationAsReadResponseSchema.parse({
        status: "success",
        code: StatusCode.OK,
        message: "Notification marked as read",
        data: updatedNotification,
      });
      res.status(response.code).json(response);
    } catch (error) {
      next(error);
    }
  }
}
