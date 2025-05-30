import mongoose, { Schema, model, Document, Model } from "mongoose";

export interface CoinDocument extends Document {
  _id: mongoose.Types.ObjectId;
  goldToINRRatio: number;
  redeemPointsToGoldRatio: number;
  purchasePackages: {
    _id: mongoose.Types.ObjectId;
    coinAmount: number;
    priceInINR: number;
  }[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CoinSchema = new Schema<CoinDocument>(
  {
    goldToINRRatio: {
      type: Number,
      required: true,
    },
    redeemPointsToGoldRatio: {
      type: Number,
      required: true,
    },
    purchasePackages: [
      {
        coinAmount: { type: Number, required: true },
        priceInINR: { type: Number, required: true },
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
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

export const CoinModel: Model<CoinDocument> = model<CoinDocument>(
  "coin",
  CoinSchema
);
