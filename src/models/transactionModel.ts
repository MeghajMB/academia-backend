import mongoose, { Schema, Document } from "mongoose";

export type TransactionStatus = "pending" | "success" | "failed";
export type PurchaseType = "course" | "service" | "coins";

export interface ITransaction extends Document {
  userId: string;
  amount: number;
  status: TransactionStatus;
  purchaseType: PurchaseType;
  purchaseId?: string; // Course ID, Service ID, or Coin Package ID
  paymentId?: string;
  orderId?: string;
  paymentMethod?: string;
  details?: Record<string, any>; // Stores specific details for each purchase type
}

const TransactionSchema = new Schema<ITransaction>(
  {
    userId: { type:String, required: true },
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

export const Transaction = mongoose.model<ITransaction>("Transaction", TransactionSchema);
