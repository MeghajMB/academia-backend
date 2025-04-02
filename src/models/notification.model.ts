import mongoose, { Schema, Document, Model } from "mongoose";

export interface NotificationDocument extends Document {
  userId: mongoose.Types.ObjectId; // Receiver of the notification
  type: "course" | "payment" | "message" | "system"; // Type of notification
  title: string; // Short title for the notification
  message: string; // Detailed message
  entityId?: mongoose.Types.ObjectId; // Optional: Links to a course, transaction, etc.
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
    entityId: {
      type: mongoose.Schema.Types.ObjectId,
      required: false, // Links to a related document if needed
    },
    isRead: { type: Boolean, default: false }, // Track unread notifications
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
      },
    },
  }
);

export const NotificationModel: Model<NotificationDocument> =
  mongoose.model<NotificationDocument>("Notification", NotificationSchema);
