import { EnrollmentDocument } from "../../models/enrollment.model";
import { IRepository } from "../base/base-repository.interface";
import { ClientSession } from "mongoose";
import { Enrollment, EnrollmentWithCourse } from "../types/enrollment-repository.types";

export interface IEnrollmentRepository  extends IRepository<EnrollmentDocument>  {
  createEnrollmentWithSession(
    courseId: string,
    userId: string,
    transactionId: string,
    session: ClientSession
  ): Promise<EnrollmentDocument>;
  findOneByFilter(
    filter: Partial<Record<keyof EnrollmentDocument, any>>
  ): Promise<Enrollment | null>;
  findByStudentId(studentId: string): Promise<EnrollmentWithCourse[]>;
  updateEnrollmentProgress(
    enrollmentId: string,
    lectureId: string,
    progressPercentage: number,
    awarded50Percent: boolean,
    awarded100Percent: boolean
  ): Promise<EnrollmentDocument | null>;
}
