// src/dtos/notification.dto.ts
import { z } from "zod";

// Send Notification Request
export const SendNotificationRequestSchema = z.object({
  userId: z.string().nonempty("User ID is required"),
  type: z.enum(["course", "payment", "message", "system"], {
    required_error: "Notification type is required",
  }),
  title: z.string().nonempty("Title is required"),
  message: z.string().nonempty("Message is required"),
  entityId: z.string().nonempty("Entity ID is required"), // Could be optional if not always needed
});
export type SendNotificationRequestDTO = z.infer<
  typeof SendNotificationRequestSchema
>;

// Get User Notifications Request
export const GetUserNotificationsRequestSchema = z.object({
  userId: z.string().nonempty("User ID is required"),
});
export type GetUserNotificationsRequestDTO = z.infer<
  typeof GetUserNotificationsRequestSchema
>;

// Mark Notification As Read Request
export const MarkNotificationAsReadRequestSchema = z.object({
  notificationId: z.string().nonempty("Notification ID is required"),
});
export type MarkNotificationAsReadRequestDTO = z.infer<
  typeof MarkNotificationAsReadRequestSchema
>;
