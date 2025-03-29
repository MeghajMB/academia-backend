import mongoose, { Schema, Document, Model } from "mongoose";

// Bid Model - Represents a user's bid on a service
export interface IBidDocument extends Document {
  gigId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  amount: number; // Bid amount
  status: "accept" | "reject";
}

const BidSchema = new Schema<IBidDocument>(
  {
    gigId: { type: Schema.Types.ObjectId, ref: "Service", required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    amount: { type: Number, required: true, min: 1 },
    status: { type: String, enum: ["accept", "reject"], default: "accept" },
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

export const BidModel: Model<IBidDocument> = mongoose.model<IBidDocument>(
  "Bid",
  BidSchema
);
