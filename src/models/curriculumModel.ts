import mongoose, { Schema, Model, Document } from "mongoose";

export interface CurriculumDocument extends Document {
  userId: mongoose.Schema.Types.ObjectId;
  courseId:mongoose.Schema.Types.ObjectId;
  sections: {
    title: string;
    lectures: {
      title: string;
      content: string;
      status:"processed"|"processing";
      length:number;
    }[];
  }[];
  createdAt: Date;
  updatedAt: Date;
}

// Curriculum Schema
const CurriculumSchema = new Schema<CurriculumDocument>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    courseId:{
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    sections: [
      {
        title: {
          type: String,
          required: true,
        },
        description:{
          type:String,
          required:true
        },
        lectures: [
          {
            title: {
              type: String,
              required: true,
            },
            content: {
              type: String,
              required: true,
            },
            status:{
              type:String,
              enum:['processing','processed'],
              default:'processing',
              required:true,
            },
            length:{
              type:Number,
              required:true
            }
          },
        ],
      },
    ],
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret._id;

        if (ret.sections) {
          ret.sections.forEach((section: any) => {
            section.lectures.forEach((lecture: any) => {
              lecture.id=lecture._id
              delete lecture._id; 
            });
            section.id=section._id
            delete section._id;
          });
        }
      },
    },
  }
);

// Export Mongoose Model
export const CurriculumModel: Model<CurriculumDocument> =
  mongoose.model<CurriculumDocument>("Curriculum", CurriculumSchema);
