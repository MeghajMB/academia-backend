import mongoose, { Document, Model, Schema } from "mongoose";

// Gig Model - Represents a service posted by an instructor
export interface IGigDocument extends Document {
  instructorId: mongoose.Types.ObjectId; // Instructor who created the service
  title: string;
  description: string;
  sessionDuration: number;
  minBid: number; // Minimum bid amount
  currentBid: number; // Current highest bid amount
  currentBidder: mongoose.Schema.Types.ObjectId | null; // User ID of highest bidder
  status: "active" | "expired"; // Bidding status
  biddingExpiresAt: Date; // Bidding expiry time
  serviceDate: Date; // Date of the actual service
  createdAt: Date;
  updatedAt: Date;
}

const GigSchema = new Schema<IGigDocument>(
  {
    instructorId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    sessionDuration: { type: Number, requied: true },
    minBid: { type: Number, required: true, min: 1 },
    currentBid: { type: Number, default: 0 },
    currentBidder: { type: Schema.Types.ObjectId, ref: "User", default: null },
    status: { type: String, enum: ["active", "expired"], default: "active" },
    biddingExpiresAt: { type: Date, required: true },
    serviceDate: {
      type: Date,
      required: true,
      validate: {
        validator: function (value: Date) {
          return value > new Date(); // Ensures service date is in the future
        },
        message: "Service date must be in the future",
      },
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

export const GigModel: Model<IGigDocument> = mongoose.model<IGigDocument>(
  "Gig",
  GigSchema
);
