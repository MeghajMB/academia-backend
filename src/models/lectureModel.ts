import mongoose, { Schema, Model, Document } from "mongoose";

export interface LectureDocument extends Document {
  sectionId: mongoose.Schema.Types.ObjectId;
  courseId: mongoose.Schema.Types.ObjectId;
  title: string;
  videoUrl: string;
  duration: number;
  order: number;
  status: "processing" | "processed";
  createdAt: Date;
  updatedAt: Date;
}

const LectureSchema = new Schema<LectureDocument>(
  {
    sectionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Section",
      required: true,
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    title: { type: String, required: true },
    videoUrl: { type: String, required: true },
    duration: { type: Number, required: true },
    order: { type: Number, required: true },
    status: {
      type: String,
      enum: ["processing", "processed"],
      default: "processing",
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

export const LectureModel: Model<LectureDocument> = mongoose.model(
  "Lecture",
  LectureSchema
);
