import mongoose, { RootFilterQuery } from "mongoose";
import {
  EnrollmentModel,
  EnrollmentDocument,
} from "../../models/enrollment.model";
import { BaseRepository } from "../base/base.repository";
import { IEnrollmentRepository } from "../interfaces/enrollment-repository.interface";
import { DatabaseError } from "../../util/errors/database-error";
import { StatusCode } from "../../enums/status-code.enum";
import {
  Enrollment,
  EnrollmentWithCourse,
} from "../types/enrollment-repository.types";

export class EnrollmentRepository
  extends BaseRepository<EnrollmentDocument>
  implements IEnrollmentRepository
{
  constructor() {
    super(EnrollmentModel);
  }
  async getEnrollmentMetrics(courseId: string): Promise<EnrollmentDocument[]> {
    try {
      const enrollments = await EnrollmentModel.aggregate([
        { $match: { courseId } },
        {
          $group: {
            _id: "$courseId",
            count: { $sum: 1 },
            avgProgress: { $avg: "$progress.percentage" },
          },
        },
      ]);
      return enrollments;
    } catch (error) {
      throw new DatabaseError(
        "An unexpected database error occurred",
        StatusCode.INTERNAL_SERVER_ERROR
      );
    }
  }
  async countWithFilter(
    filter: RootFilterQuery<EnrollmentDocument> | undefined
  ): Promise<number> {
    try {
      const count = await EnrollmentModel.countDocuments(filter);
      return count;
    } catch (error) {
      throw new DatabaseError(
        "An unexpected database error occurred",
        StatusCode.INTERNAL_SERVER_ERROR
      );
    }
  }

  async findByStudentId(studentId: string): Promise<EnrollmentWithCourse[]> {
    try {
      const enrolledcourse = await EnrollmentModel.find({
        studentId,
      })
        .populate("courseId")
        .lean();
      return enrolledcourse as unknown as EnrollmentWithCourse[];
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
  ): Promise<EnrollmentDocument> {
    try {
      const enrollment = new EnrollmentModel({
        courseId,
        studentId: userId,
        transactionId,
      });
      await enrollment.save({ session });
      return enrollment;
    } catch (error) {
      throw new DatabaseError(
        "An unexpected database error occurred",
        StatusCode.INTERNAL_SERVER_ERROR
      );
    }
  }

  async findOneByFilter(
    filter: Partial<Record<keyof EnrollmentDocument, any>>
  ): Promise<Enrollment | null> {
    try {
      const enrolledcourse = await EnrollmentModel.findOne(filter).lean();
      return enrolledcourse as Enrollment | null;
    } catch (error) {
      throw new DatabaseError(
        "An unexpected database error occurred",
        StatusCode.INTERNAL_SERVER_ERROR
      );
    }
  }

  async updateEnrollmentProgress(
    enrollmentId: string,
    lectureId: string,
    progressPercentage: number,
    awarded50Percent: boolean,
    awarded100Percent: boolean
  ): Promise<EnrollmentDocument | null> {
    try {
      const updatedEnrollment = await EnrollmentModel.findOneAndUpdate(
        { _id: enrollmentId },
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
