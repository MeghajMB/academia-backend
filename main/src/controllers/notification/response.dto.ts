import { z } from "zod";
import { SuccessResponseSchema } from "../shared-response.dto";

// Send Notification Response
export const SendNotificationResponseSchema = SuccessResponseSchema.extend({
  data: z
    .object({
      _id: z.coerce.string(),
      userId: z.string(),
      type: z.string(),
      title: z.string(),
      message: z.string(),
      entityId: z.string(),
      isRead: z.boolean(),
      createdAt: z.string().optional(), // Assuming ISO date string or similar
    })
    .transform((data) => ({
      id: data._id,
      userId: data.userId,
      type: data.type,
      title: data.title,
      message: data.message,
      entityId: data.entityId,
      isRead: data.isRead,
      createdAt: data.createdAt,
    })),
});
export type SendNotificationResponseDTO = z.infer<
  typeof SendNotificationResponseSchema
>;

// Get User Notifications Response
export const GetUserNotificationsResponseSchema = SuccessResponseSchema.extend({
  data: z.array(
    z.object({
      id: z.string(),
      userId: z.string(),
      type: z.string(),
      title: z.string(),
      message: z.string(),
      entityId: z.string(),
      isRead: z.boolean(),
      createdAt: z.string(),
    })
  ),
});
export type GetUserNotificationsResponseDTO = z.infer<
  typeof GetUserNotificationsResponseSchema
>;

// Mark Notification As Read Response
export const MarkNotificationAsReadResponseSchema =
  SuccessResponseSchema.extend({
    data: z.null(),
  });
export type MarkNotificationAsReadResponseDTO = z.infer<
  typeof MarkNotificationAsReadResponseSchema
>;

// Mark Notification As Read Response
export const MarkAllNotificationAsReadResponseSchema =
  SuccessResponseSchema.extend({
    data: z.null(),
  });

export type MarkAllNotificationAsReadResponseDTO = z.infer<
  typeof MarkAllNotificationAsReadResponseSchema
>;
