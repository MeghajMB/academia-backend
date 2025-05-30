import { Request, Response, NextFunction } from "express";

export interface INotificationController {
  sendNotification(req: Request, res: Response, next: NextFunction): Promise<void>;
  getUserNotifications(req: Request, res: Response, next: NextFunction): Promise<void>;
  markNotificationAsRead(req: Request, res: Response, next: NextFunction): Promise<void>;
  markAllNotificationAsRead(req: Request, res: Response, next: NextFunction): Promise<void>;
}
