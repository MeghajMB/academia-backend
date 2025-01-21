
import { CurriculumModel } from "../models/curriculumModel";
import { ICurriculumRepository, ICurriculumResult } from "./interfaces/curriculumRepository";

export class CurriculumRepository implements ICurriculumRepository {
  async createCurriculum(curriculumData:object,transactionSession:object): Promise<ICurriculumResult | null> {
    const newCurriculum = new CurriculumModel(curriculumData,transactionSession);
    return newCurriculum;
  }
 
}
