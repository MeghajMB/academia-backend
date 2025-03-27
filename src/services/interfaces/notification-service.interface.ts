export interface INotificationService {
    sendNotification(
      userId: string,
      type: "course" | "payment" | "message" | "system",
      title: string,
      message: string,
      entityId?: string
    ): Promise<any>;
  
    getUserNotifications(userId: string): Promise<any>;
  
    markNotificationAsRead(notificationId: string): Promise<any>;
  }
  