export interface GetUserNotificationResponse{
    id: string;
    userId: string;
    type: "message" | "course" | "payment" | "system";
    title: string;
    message: string;
    entityId: string | undefined;
    isRead: boolean;
    createdAt: string;
}