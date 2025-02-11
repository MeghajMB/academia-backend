import mongoose, { Document } from "mongoose";
import { ICurriculumResult } from "../../types/courseInterface";


export interface ICurriculumRepository {
  createCurriculum(curriculumData: object,transactionSession:object): Promise<ICurriculumResult|null>;
  getCurriculum(courseId:string): Promise<ICurriculumResult|null>;
  addSectionToCurriculum(courseId:string,section:{title:string,description:string}): Promise<ICurriculumResult|null>;
  // Additional methods like getUser, updateUser, etc.
}
