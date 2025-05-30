import mongoose, { Schema, Model, Document, Types } from "mongoose";

export interface WalletDocument extends Document {
  _id: mongoose.Types.ObjectId;
  userId: Types.ObjectId;
  totalEarnings: number;
  goldCoins: number;
  redeemPoints: number;
  isLocked: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const walletSchema = new Schema<WalletDocument>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    totalEarnings:{ type: Number, default: 0 },
    goldCoins: { type: Number, default: 0 },
    redeemPoints: { type: Number, default: 0 },
    isLocked: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const WalletModel: Model<WalletDocument> = mongoose.model(
  "Wallet",
  walletSchema
);
