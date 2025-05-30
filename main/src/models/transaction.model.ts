import mongoose, { Schema, Document } from "mongoose";

export interface TransactionDocument extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  amount: number;
  status: "pending" | "success" | "failed";
  purchaseType: "course" | "service" | "coins";
  type: "credit" | "debit";
  purchaseId?: mongoose.Types.ObjectId;
  paymentId?: string;
  orderId?: string;
  paymentMethod?: string;
  platformShare?:number;
  instructorShare?:number;
  details?: Record<string, any>; // store extra details
  createdAt: Date;
  updatedAt: Date;
}

const TransactionSchema = new Schema<TransactionDocument>(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, required: true },
    amount: { type: Number, required: true },
    status: {
      type: String,
      enum: ["pending", "success", "failed"],
      default: "pending",
    },
    platformShare: { type: Number },
    instructorShare: { type: Number },
    type: {
      type: String,
      enum: ["credit", "debit"],
      required: true,
    },
    purchaseType: {
      type: String,
      enum: ["course", "conversion", "coins"],
      required: true,
    },
    purchaseId: { type: mongoose.Schema.Types.ObjectId },
    orderId: { type: String },
    paymentId: { type: String, required: true },
    paymentMethod: { type: String },
    details: { type: Object },
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

export const TransactionModel = mongoose.model<TransactionDocument>(
  "Transaction",
  TransactionSchema
);
