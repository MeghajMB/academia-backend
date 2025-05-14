import mongoose, { Document, Model, Schema } from "mongoose";

// Gig Model - Represents a service posted by an instructor
export interface GigDocument extends Document {
  _id: mongoose.Types.ObjectId;
  instructorId: mongoose.Types.ObjectId; // Instructor who created the service
  title: string;
  description: string;
  sessionDuration: number;
  minBid: number; // Minimum bid amount
  currentBid: number; // Current highest bid amount
  currentBidder: mongoose.Types.ObjectId | null; // User ID of highest bidder
  status: "active" | "expired" | "completed" | "no-bids" | "missed";
  // active for active gigs,completed when instructor successfuluy completes it,no-bids when there are no bids
  //missed when the instructor didnt take the session,expired when the bidding is closed and waiting for session
  biddingExpiresAt: Date; // Bidding expiry time
  sessionDate: Date; // Date of the actual service
  biddingAllowed: boolean;
  maxParticipants: number;
  createdAt: Date;
  updatedAt: Date;
}

const GigSchema = new Schema<GigDocument>(
  {
    instructorId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    sessionDuration: { type: Number, requied: true },
    minBid: { type: Number, required: true, min: 1 },
    currentBid: { type: Number, default: 0 },
    currentBidder: { type: Schema.Types.ObjectId, ref: "User", default: null },
    biddingAllowed: { type: Boolean, default: true, required: true },
    maxParticipants: { type: Number, default: 1, required: true },
    status: {
      type: String,
      enum: ["active", "expired", "completed", "no-bids", "missed"],
      default: "active",
    },
    biddingExpiresAt: { type: Date, required: true },
    sessionDate: {
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

export const GigModel: Model<GigDocument> = mongoose.model<GigDocument>(
  "Gig",
  GigSchema
);
