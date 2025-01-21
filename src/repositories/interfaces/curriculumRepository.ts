import mongoose, { Document } from "mongoose";
export interface ICurriculumResult extends Document {
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

export interface ICurriculumRepository {
  createCurriculum(curriculumData: object,transactionSession:object): Promise<ICurriculumResult|null>;
  // Additional methods like getUser, updateUser, etc.
}
