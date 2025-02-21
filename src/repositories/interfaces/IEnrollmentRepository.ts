import mongoose, { Document } from "mongoose";
import { IEnrollmentDocument } from "../../models/enrollmentModel";

export interface IEnrollmentRepository {
  create(
    courseId: string,
    userId: string,
    transactionId: string,
    session: { session: mongoose.mongo.ClientSession }
  ): Promise<IEnrollmentDocument>;
  findOneByfilter(
    filter: Partial<Record<keyof IEnrollmentDocument, any>>
  ): Promise<IEnrollmentDocument | null>
}
