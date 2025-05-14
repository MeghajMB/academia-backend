import mongoose, { Schema, Document, Model } from "mongoose";

// Bid Model - Represents a user's bid on a service
export interface BidDocument extends Document {
  _id: mongoose.Types.ObjectId;
  gigId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  amount: number; // Bid amount
  status: "accept" | "reject";
  createdAt: Date;
  updatedAt: Date;
}

const BidSchema = new Schema<BidDocument>(
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

export const BidModel: Model<BidDocument> = mongoose.model<BidDocument>(
  "Bid",
  BidSchema
);
