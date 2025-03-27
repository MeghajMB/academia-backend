import mongoose from "mongoose";
import { EnrollmentModel, IEnrollmentDocument } from "../../models/enrollment.model";
import { BaseRepository } from "../base/base.repository";
import { IEnrollmentRepository } from "../interfaces/enrollment-repository.interface";
import { IEnrollmentWithCourse } from "../../types/course.interface";
import { DatabaseError } from "../../util/errors/database-error";
import { StatusCode } from "../../enums/status-code.enum";


export class EnrollmentRepository
  extends BaseRepository<IEnrollmentDocument>
  implements IEnrollmentRepository
{
  constructor() {
    super(EnrollmentModel);
  }
  async findByStudentId(studentId: string): Promise<IEnrollmentWithCourse[]> {
    try {
      const enrolledcourse = (await EnrollmentModel.find({
        studentId,
      }).populate("courseId")) as unknown as IEnrollmentWithCourse[];
      return enrolledcourse;
    } catch (error) {
      throw new DatabaseError(
        "An unexpected database error occurred",
        StatusCode.INTERNAL_SERVER_ERROR
      );
    }
  }

  async createEnrollmentWithSession(
    courseId: string,
    userId: string,
    transactionId: string,
    session: mongoose.mongo.ClientSession
  ): Promise<IEnrollmentDocument> {
    try {
      const enrollment = new EnrollmentModel({
        courseId,
        studentId: userId,
        transactionId,
      });
      enrollment.save({ session });
      return enrollment;
    } catch (error) {
      throw new DatabaseError(
        "An unexpected database error occurred",
        StatusCode.INTERNAL_SERVER_ERROR
      );
    }
  }

  async findOneByFilter(
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

  async updateEnrollmentProgress(
    enrollment: IEnrollmentDocument,
    lectureId: string,
    progressPercentage: number,
    awarded50Percent: boolean,
    awarded100Percent: boolean
  ): Promise<IEnrollmentDocument | null> {
    try {
      const updatedEnrollment = await EnrollmentModel.findOneAndUpdate(
        { _id: enrollment._id },
        {
          $push: { "progress.completedLectures": lectureId },
          "progress.percentage": progressPercentage,
          "progress.awarded50Percent": awarded50Percent,
          "progress.awarded100Percent": awarded100Percent,
        },
        { new: true }
      );
      return updatedEnrollment;
    } catch (error) {
      throw new DatabaseError(
        "An unexpected database error occurred",
        StatusCode.INTERNAL_SERVER_ERROR
      );
    }
  }
}
