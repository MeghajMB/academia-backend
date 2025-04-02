import { NotificationDocument } from "../../models/notification.model";

export interface INotificationService {
    sendNotification(
      userId: string,
      type: "course" | "payment" | "message" | "system",
      title: string,
      message: string,
      entityId?: string
    ): Promise<NotificationDocument>;
  
    getUserNotifications(userId: string):Promise<NotificationDocument[]>;
  
    markNotificationAsRead(notificationId: string):Promise<{message:"success"}>;
  }
  