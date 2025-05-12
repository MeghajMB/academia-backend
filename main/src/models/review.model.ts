import mongoose, { Schema, Document, Model } from "mongoose";

export interface ReviewDocument extends Document {
   _id: mongoose.Types.ObjectId;
  courseId: mongoose.Types.ObjectId|string; // The course being reviewed
  studentId:  mongoose.Types.ObjectId|string; // The student who wrote the review
  rating: number; // Rating (1-5)
  comment: string; // Review text
  createdAt: Date;
  updatedAt: Date;
}

const ReviewSchema: Schema<ReviewDocument> = new mongoose.Schema(
  {
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      required: true,
      maxlength: 1000,
    },
  },
  {
    timestamps: true, // Auto-manages createdAt & updatedAt
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
      },
    },
  }
);

export const ReviewModel: Model<ReviewDocument> =
  mongoose.model<ReviewDocument>("Review", ReviewSchema);
