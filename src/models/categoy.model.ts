import mongoose, { Schema, Document, Model } from "mongoose";

export interface CategoryDocument extends Document {
  name: string;
  description: string;
  isBlocked: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CategorySchema: Schema<CategoryDocument> = new Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    description: { type: String, required: true },
    isBlocked: { type: Boolean, default: false, required: true },
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

export const CategoryModel: Model<CategoryDocument> =
  mongoose.model<CategoryDocument>("Category", CategorySchema);
