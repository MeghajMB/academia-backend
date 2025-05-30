import mongoose, { Schema, Document } from "mongoose";

export interface PaymentDocument extends Document {
   _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  amount: number;
  coinAmt:number;
  currency: string;
  status: 'created' | 'attempted' | 'paid' | 'failed';
  razorpayOrderId: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
  purchaseType: "course" | "coins";
  purchaseId: string;
}

const PaymentSchema = new Schema<PaymentDocument>(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, required: true },
    amount: { type: Number, required: true },
    currency: { type: String, default: "INR" },
    status: {
      type: String,
      enum: ["created","attempted", "paid", "failed"],
      default: "created",
    },
    razorpayOrderId: { type: String, required: true, unique: true },
    razorpayPaymentId: { type: String },
    razorpaySignature: { type: String },
    purchaseType: {
      type: String,
      enum: ["course", "coins"],
      required: true,
    },
    purchaseId: { type: String, required: true },
    coinAmt:{ type: Number },
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
