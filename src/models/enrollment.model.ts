import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface EnrollmentDocument extends Document {
  studentId: Types.ObjectId;
  courseId: Types.ObjectId;
  transactionId: Types.ObjectId; // Payment reference
  purchaseDate: Date;
  status: "active" | "refunded" | "expired";
  reviewStatus: boolean;
  progress: {
    completedLectures: string[];
    percentage: number;
    awarded50Percent: boolean;
    awarded100Percent: boolean;
  };
  completedAt?: Date;
  certificateUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

const EnrollmentSchema: Schema<EnrollmentDocument> = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      immutable: true,
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
      immutable: true,
    },
    transactionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Transaction",
      required: true,
      immutable: true,
    }, // Payment reference
    purchaseDate: { type: Date, default: Date.now, immutable: true },
    status: {
      type: String,
      enum: ["active", "refunded", "expired"],
      default: "active",
    },
    reviewStatus: {
      type: Boolean,
      default: false,
    }, // check if the user has reviewed
    progress: {
      completedLectures: [
        { type: mongoose.Schema.Types.ObjectId, ref: "Lecture" },
      ], // Track completed lectures
      percentage: {
        type: Number,
        min: [0, "Percentage cannot be less than 0"],
        max: [100, "Percentage cannot exceed 100"],
        default: 0,
      },
      awarded50Percent: { type: Boolean, default: false },
      awarded100Percent: { type: Boolean, default: false },
    },
    completedAt: { type: Date, default: null },
    certificateUrl: {
      type: String,
      default: null,
      match: [/^https?:\/\/.+$/, "Must be a valid URL"], // Basic URL validation
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

// Prevent duplicate completedLectures
EnrollmentSchema.path("progress.completedLectures").validate({
  validator: function (lectures: mongoose.Types.ObjectId[]) {
    const uniqueLectures = new Set(lectures.map((l) => l.toString()));
    return uniqueLectures.size === lectures.length;
  },
  message: "Duplicate lectures are not allowed",
});

export const EnrollmentModel: Model<EnrollmentDocument> =
  mongoose.model<EnrollmentDocument>("Enrollment", EnrollmentSchema);
