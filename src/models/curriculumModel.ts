import mongoose, { Schema, Model, Document } from "mongoose";

export interface CurriculumDocument extends Document {
    courseId: mongoose.Schema.Types.ObjectId;
    sections: {
      section: number;
      title: string;
      lectures: {
        order: number;
        title: string;
        content: string;
      }[];
    }[];
    createdAt: Date;
    updatedAt: Date;
  }

// Curriculum Schema
const CurriculumSchema = new Schema<CurriculumDocument>(
  {
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    sections: [
      {
        section: {
          type: Number,
          required: true,
        },
        title: {
          type: String,
          required: true,
        },
        lectures: [
          {
            order: {
              type: Number,
              required: true,
            },
            title: {
              type: String,
              required: true,
            },
            content: {
              type: String,
              required: true,
            },
          },
        ],
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Export Mongoose Model
export const CurriculumModel: Model<CurriculumDocument> = mongoose.model<CurriculumDocument>(
  "Curriculum",
  CurriculumSchema
);
