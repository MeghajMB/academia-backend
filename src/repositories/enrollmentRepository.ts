import mongoose from "mongoose";
import { IEnrollmentRepository } from "./interfaces/IEnrollmentRepository";
import {
  EnrollmentModel,
  IEnrollmentDocument,
} from "../models/enrollmentModel";
import { DatabaseError } from "../errors/database-error";
import { StatusCode } from "../enums/statusCode.enum";

export class EnrollmentRepository implements IEnrollmentRepository {
  async create(
    courseId: string,
    userId: string,
    transactionId: string,
    session: { session: mongoose.mongo.ClientSession }
  ): Promise<IEnrollmentDocument> {
    try {
      const enrollment = new EnrollmentModel({
        courseId,
        studentId: userId,
        transactionId,
      });
      enrollment.save(session);
      return enrollment;
    } catch (error) {
      throw new DatabaseError(
        "An unexpected database error occurred",
        StatusCode.INTERNAL_SERVER_ERROR
      );
    }
  }
  async findOneByfilter(
    filter: Partial<Record<keyof IEnrollmentDocument, any>>
  ): Promise<IEnrollmentDocument | null> {
    try {
      const enrolledcourse = await EnrollmentModel.findOne(filter);
      return enrolledcourse;
    } catch (error) {
      throw new DatabaseError(
        "An unexpected database error occurred",
        StatusCode.INTERNAL_SERVER_ERROR
      );
    }
  }
}
