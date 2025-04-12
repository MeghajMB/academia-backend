import mongoose, { Schema, Document } from "mongoose";

export type TransactionStatus = "pending" | "success" | "failed";
export type PurchaseType = "course" | "service" | "coins";

export interface TransactionDocument extends Document {
   _id: mongoose.Types.ObjectId;
  userId:  mongoose.Types.ObjectId;
  amount: number;
  status: TransactionStatus;
  purchaseType: PurchaseType;
  purchaseId?: string; // Course ID, Service ID, or Coin Package ID
  paymentId?: string;
  orderId?: string;
  paymentMethod?: string;
  details?: Record<string, any>; // Stores specific details for each purchase type
}

const TransactionSchema = new Schema<TransactionDocument>(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, required: true },
    amount: { type: Number, required: true },
    status: { type: String, enum: ["pending", "success", "failed"], default: "pending" },
    purchaseType: { type: String, enum: ["course", "service", "coins"], required: true },
    purchaseId: { type: String },
    orderId: { type: String },
    paymentId: { type: String,required:true },
    paymentMethod: { type: String },
    details: { type: Object }, // Flexible field for additional details
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

export const TransactionModel = mongoose.model<TransactionDocument>("Transaction", TransactionSchema);
