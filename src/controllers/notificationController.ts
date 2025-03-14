import { Request, Response, NextFunction } from "express";
import { NotificationService } from "../services/notificationService";

export class NotificationController {
  constructor(private notificationService: NotificationService) {}

  async sendNotification(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId, type, title, message, entityId } = req.body;
      const notification = await this.notificationService.sendNotification(userId, type, title, message, entityId);
      res.status(201).json(notification);
    } catch (error) {
      next(error);
    }
  }

  async getUserNotifications(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId } = req.params;
      const id=req.verifiedUser
      const notifications = await this.notificationService.getUserNotifications(userId);
      res.status(200).json(notifications);
    } catch (error) {
      next(error);
    }
  }

  async markNotificationAsRead(req: Request, res: Response, next: NextFunction) {
    try {
      const { notificationId } = req.params;
      const updatedNotification = await this.notificationService.markNotificationAsRead(notificationId);
      res.status(200).json(updatedNotification);
    } catch (error) {
      next(error);
    }
  }
}
