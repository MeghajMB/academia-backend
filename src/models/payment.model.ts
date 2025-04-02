import mongoose, { Schema, Document } from "mongoose";

export type PaymentStatus = "pending" | "success" | "failed";

export interface PaymentDocument extends Document {
  userId: mongoose.Types.ObjectId;
  amount: number;
  currency: string;
  status: PaymentStatus;
  orderId: string;
  paymentId?: string;
  paymentMethod?: string;
  purchaseType: "course" | "service" | "coins";
  purchaseId: string;
}

const PaymentSchema = new Schema<PaymentDocument>(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, required: true },
    amount: { type: Number, required: true },
    currency: { type: String, default: "INR" },
    status: {
      type: String,
      enum: ["pending", "success", "failed"],
      default: "pending",
    },
    orderId: { type: String, required: true, unique: true },
    paymentId: { type: String },
    paymentMethod: { type: String },
    purchaseType: {
      type: String,
      enum: ["course", "service", "coins"],
      required: true,
    },
    purchaseId: { type: String, required: true },
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

export const PaymentModel = mongoose.model<PaymentDocument>(
  "Payment",
  PaymentSchema
);
