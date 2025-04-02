import mongoose, { Schema, Model, Document } from "mongoose";

export interface SectionDocument extends Document {
  courseId:  mongoose.Types.ObjectId;
  title: string;
  order: number;
  description:string;
  createdAt: Date;
  updatedAt: Date;
}

const SectionSchema = new Schema<SectionDocument>(
  {
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    title: { type: String, required: true },
    description:{ type: String, required: true },
    order: { type: Number, required: true },
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

export const SectionModel: Model<SectionDocument> = mongoose.model(
  "Section",
  SectionSchema
);
