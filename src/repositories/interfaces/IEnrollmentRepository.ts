import mongoose, { Document } from "mongoose";
import { IEnrollmentDocument } from "../../models/enrollmentModel";
import { IEnrollmentWithCourse } from "../../types/course.interface";
import { IRepository } from "../base/IRepositoryInterface";

export interface IEnrollmentRepository  extends IRepository<IEnrollmentDocument>  {
  createEnrollmentWithSession(
    courseId: string,
    userId: string,
    transactionId: string,
    session: mongoose.mongo.ClientSession
  ): Promise<IEnrollmentDocument>;
  findOneByFilter(
    filter: Partial<Record<keyof IEnrollmentDocument, any>>
  ): Promise<IEnrollmentDocument | null>;
  findByStudentId(studentId: string): Promise<IEnrollmentWithCourse[]>;
  updateEnrollmentProgress(
    enrollment: IEnrollmentDocument,
    lectureId: string,
    progressPercentage: number,
    awarded50Percent: boolean,
    awarded100Percent: boolean
  ): Promise<IEnrollmentDocument | null>;
}
