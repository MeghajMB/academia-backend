import { NotificationDocument } from "../../models/notification.model";
import { GetUserNotificationResponse } from "./notification.types";

export interface INotificationService {
    sendNotification(
      userId: string,
      type: "course" | "payment" | "message" | "system",
      title: string,
      message: string,
      entityId?: string
    ): Promise<NotificationDocument>;
  
    getUserNotifications(userId: string):Promise<GetUserNotificationResponse[]>;
  
    markNotificationAsRead(notificationId: string):Promise<{message:"success"}>;
  }
  