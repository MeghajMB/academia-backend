import mongoose, { Schema, Document, Model } from "mongoose";

export interface NotificationDocument extends Document {
  userId: mongoose.Schema.Types.ObjectId; // Receiver of the notification
  type: "course" | "payment" | "message" | "system"; // Type of notification
  title: string; // Short title for the notification
  message: string; // Detailed message
  referenceId?: mongoose.Schema.Types.ObjectId; // Optional: Links to a course, transaction, etc.
  referenceType?: "Course" | "Transaction" | "Message"; // What entity this notification is linked to
  isRead: boolean; // Whether the user has seen it
  createdAt: Date;
}

const NotificationSchema: Schema<NotificationDocument> = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: ["course", "payment", "message", "system"],
      required: true,
    },
    title: { type: String, required: true }, // Short description
    message: { type: String, required: true }, // Detailed info
    referenceId: {
      type: mongoose.Schema.Types.ObjectId,
      required: false, // Links to a related document if needed
    },
    referenceType: {
      type: String,
      enum: ["Course", "Transaction", "Message"],
      required: false,
    },
    isRead: { type: Boolean, default: false }, // Track unread notifications
  },
  { timestamps: true }
);

export const NotificationModel: Model<NotificationDocument> =
  mongoose.model<NotificationDocument>("Notification", NotificationSchema);
