import mongoose, { Document, Schema, Model } from "mongoose";

export interface SessionDocument extends Document {
   _id: mongoose.Types.ObjectId;
  gigId:  mongoose.Types.ObjectId;
  instructorId: mongoose.Types.ObjectId;
  sessionDate: Date;
  sessionDuration: number; // Duration in minutes
  participants: {
    userId: mongoose.Types.ObjectId;
    joinTimes: Date[];
    leaveTimes: Date[];
    totalTimeSpent: number; // In seconds
  }[];
  status: "scheduled" | "in-progress" | "completed" | "missed";
  createdAt: Date;
  updatedAt: Date;
}

const SessionSchema = new Schema<SessionDocument>(
  {
    gigId: { type: Schema.Types.ObjectId, ref: "Gig", required: true },
    instructorId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    sessionDate: { type: Date, required: true },
    sessionDuration: { type: Number, required: true }, // In minutes
    participants: [
      {
        userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
        joinTimes: [{ type: Date, required: true }],
        leaveTimes: [{ type: Date }],
        totalTimeSpent: { type: Number, default: 0 }, // Total seconds
      },
    ],
    status: {
      type: String,
      enum: ["scheduled", "in-progress", "completed", "missed"],
      default: "scheduled",
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

export const SessionModel: Model<SessionDocument> =
  mongoose.model<SessionDocument>("Session", SessionSchema);
