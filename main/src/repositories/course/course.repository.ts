import mongoose, { FilterQuery, Model } from "mongoose";
import { StatusCode } from "../../enums/status-code.enum";
import { CourseDocument } from "../../models/course.model";
import { BaseRepository } from "../base/base.repository";
import { ICourseRepository } from "./course.interface";
import { DatabaseError } from "../../util/errors/database-error";
import {
  CourseWithPopulatedCategory,
  CourseWithPopulatedFields,
  FetchAllPaginatedCoursesResult,
  fetchCourseMetricsRepositoryResponse,
  getAnalyticsResponse,
  getAnalyticsSummaryResponse,
} from "./course.types";
import { CategoryDocument } from "../../models/categoy.model";
import { inject, injectable } from "inversify";
import { Types } from "../../container/types";

@injectable()
export class CourseRepository
  extends BaseRepository<CourseDocument>
  implements ICourseRepository
{
  constructor(
    @inject(Types.CourseModel)
    private readonly courseModel: Model<CourseDocument>
  ) {
    super(courseModel);
  }
  async getAnalyticsSummary(
    courseId: string,
    userId: string
  ): Promise<getAnalyticsSummaryResponse> {
    try {
      const metricsSummary = await this.courseModel.aggregate([
        {
          $match: {
            _id: new mongoose.Types.ObjectId(courseId),
            userId: new mongoose.Types.ObjectId(userId),
            status: "listed",
          },
        },
        {
          $lookup: {
            from: "reviews",
            let: { courseId: "$_id" },
            pipeline: [
              {
                $match: {
                  $expr: { $eq: ["$courseId", "$$courseId"] },
                },
              },
              {
                $project: {
                  rating: 1,
                },
              },
            ],
            as: "reviews",
          },
        },
        {
          $lookup: {
            from: "transactions",
            let: { courseId: "$_id" },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ["$purchaseType", "course"] },
                      { $eq: ["$status", "success"] },
                      { $eq: ["$purchaseId", "$$courseId"] },
                    ],
                  },
                },
              },
              {
                $project: {
                  amount: 1,
                },
              },
            ],
            as: "transactions",
          },
        },
        {
          $lookup: {
            from: "enrollments",
            let: { courseId: "$_id" },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $eq: ["$courseId", "$$courseId"],
                  },
                },
              },
              {
                $project: {
                  percentage: "$progress.percentage",
                },
              },
            ],
            as: "enrollments",
          },
        },
        {
          $project: {
            totalRevenue: { $sum: "$transactions.amount" },
            totalStudents: { $size: "$enrollments" },
            averageProgress: {
              $cond: [
                { $gt: [{ $size: "$enrollments" }, 0] },
                {
                  $avg: "$enrollments.percentage",
                },
                0,
              ],
            },
            reviewCount: { $size: "$reviews" },
            averageRating: {
              $cond: [
                { $gt: [{ $size: "$reviews" }, 0] },
                { $round: [{ $avg: "$reviews.rating" }, 1] },
                0,
              ],
            },
            reviews: 1,
          },
        },
      ]);
      return (
        metricsSummary[0] ?? {
          totalRevenue: 0,
          totalStudents: 0,
          averageProgress: 0,
          reviews: [],
        }
      );
    } catch (error: unknown) {
      console.log(error);
      throw new DatabaseError(
        "An unexpected database error occurred",
        StatusCode.INTERNAL_SERVER_ERROR
      );
    }
  }
  async getAnalytics(
    courseId: string,
    userId: string,
    start: Date,
    end: Date,
    filter: "month" | "quarter" | "year"
  ): Promise<[getAnalyticsResponse] | []> {
    try {
      const result = await this.courseModel.aggregate([
        {
          $match: {
            userId: new mongoose.Types.ObjectId(userId),
            status: "listed",
            _id: new mongoose.Types.ObjectId(courseId),
          },
        },
        {
          $facet: {
            enrollments: [
              {
                $lookup: {
                  from: "enrollments",
                  let: { courseId: "$_id" },
                  pipeline: [
                    {
                      $match: {
                        $expr: { $eq: ["$courseId", "$$courseId"] },
                        createdAt: { $gte: start, $lte: end },
                      },
                    },
                    {
                      $project: {
                        date: {
                          $dateToString: {
                            format:
                              filter === "year"
                                ? "%Y-%m"
                                : filter === "quarter"
                                ? "%Y-%m-%d"
                                : "%Y-%m-%d",
                            date: "$createdAt",
                          },
                        },
                        progress: "$progress.percentage",
                      },
                    },
                    {
                      $group: {
                        _id: "$date",
                        count: { $sum: 1 },
                        averageProgress: { $avg: "$progress" },
                      },
                    },
                    {
                      $project: {
                        date: "$_id",
                        count: 1,
                        averageProgress: { $round: ["$averageProgress", 1] },
                        _id: 0,
                      },
                    },
                    { $sort: { date: 1 } },
                  ],
                  as: "enrollments",
                },
              },
            ],
            transactions: [
              {
                $lookup: {
                  from: "transactions",
                  let: { courseId: "$_id" },
                  pipeline: [
                    {
                      $match: {
                        $expr: {
                          $and: [
                            { $eq: ["$purchaseType", "course"] },
                            { $eq: ["$status", "success"] },
                            { $eq: ["$purchaseId", "$$courseId"] },
                          ],
                        },
                        createdAt: { $gte: start, $lte: end },
                      },
                    },
                    {
                      $project: {
                        date: {
                          $dateToString: {
                            format:
                              filter === "year"
                                ? "%Y-%m"
                                : filter === "quarter"
                                ? "%Y-%m-%d"
                                : "%Y-%m-%d",
                            date: "$createdAt",
                          },
                        },
                        amount: 1,
                      },
                    },
                    {
                      $group: {
                        _id: "$date",
                        totalAmount: { $sum: "$amount" },
                      },
                    },
                    {
                      $project: {
                        date: "$_id",
                        totalAmount: 1,
                        _id: 0,
                      },
                    },
                    { $sort: { date: 1 } },
                  ],
                  as: "transactions",
                },
              },
            ],
          },
        },
        {
          $project: {
            enrollments: { $arrayElemAt: ["$enrollments.enrollments", 0] },
            transactions: { $arrayElemAt: ["$transactions.transactions", 0] },
          },
        },
      ]);
      return result as [getAnalyticsResponse] | [];
    } catch (error: unknown) {
      console.log(error);
      throw new DatabaseError(
        "An unexpected database error occurred",
        StatusCode.INTERNAL_SERVER_ERROR
      );
    }
  }
  async fetchCourseMetrics(
    userId: string
  ): Promise<fetchCourseMetricsRepositoryResponse[]> {
    try {
      const courseMetrics = await this.courseModel.aggregate([
        {
          $match: {
            userId: new mongoose.Types.ObjectId(userId),
            status: "listed",
          },
        },
        {
          $lookup: {
            from: "transactions",
            let: { courseId: "$_id" },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ["$purchaseType", "course"] },
                      { $eq: ["$status", "success"] },
                      { $eq: ["$purchaseId", "$$courseId"] },
                    ],
                  },
                },
              },
            ],
            as: "transactions",
          },
        },
        {
          $lookup: {
            from: "enrollments",
            let: { courseId: "$_id" },
            pipeline: [
              {
                $match: {
                  $expr: { $eq: ["$courseId", "$$courseId"] },
                },
              },
            ],
            as: "enrollments",
          },
        },
        {
          $lookup: {
            from: "reviews",
            let: { courseId: "$_id" },
            pipeline: [
              {
                $match: {
                  $expr: { $eq: ["$courseId", "$$courseId"] },
                },
              },
            ],
            as: "reviews",
          },
        },
        {
          $project: {
            transactions: 1,
            enrollments: 1,
            reviews: 1,
          },
        },
        {
          $group: {
            _id: null,
            totalCourses: { $sum: 1 },
            totalEarnings: { $sum: { $sum: "$transactions.amount" } },
            totalStudents: { $sum: { $size: "$enrollments" } },
            totalReviews: { $sum: { $size: "$reviews" } },
            allRatings: { $push: "$reviews.rating" },
          },
        },
        {
          $unwind: {
            path: "$allRatings",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $unwind: {
            path: "$allRatings",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $group: {
            _id: null,
            totalCourses: { $first: "$totalCourses" },
            totalEarnings: { $first: "$totalEarnings" },
            totalStudents: { $first: "$totalStudents" },
            totalReviews: { $first: "$totalReviews" },
            averageRating: { $avg: "$allRatings" },
            reviewDistribution: {
              $push: "$allRatings",
            },
          },
        },
        {
          $addFields: {
            averageRating: {
              $ifNull: ["$averageRating", 0],
            },
            reviewDistribution: {
              $arrayToObject: {
                $map: {
                  input: [1, 2, 3, 4, 5],
                  as: "star",
                  in: {
                    k: { $toString: "$$star" },
                    v: {
                      $size: {
                        $filter: {
                          input: "$reviewDistribution",
                          as: "r",
                          cond: { $eq: ["$$r", "$$star"] },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      ]);

      return courseMetrics as unknown as fetchCourseMetricsRepositoryResponse[];
    } catch (error) {
      console.log(error);
      throw new DatabaseError(
        "An unexpected database error occurred",
        StatusCode.INTERNAL_SERVER_ERROR
      );
    }
  }

  async createCourseWithSession(
    course: Partial<CourseDocument>,
    session: object
  ): Promise<CourseDocument> {
    try {
      const createdCourse = new this.courseModel(course);
      await createdCourse.save(session);
      return createdCourse;
    } catch (error: unknown) {
      throw new DatabaseError(
        "An unexpected database error occurred",
        StatusCode.INTERNAL_SERVER_ERROR
      );
    }
  }

  async findAllPaginatedCourses({
    query,
    skip,
    sort,
    limit,
  }: {
    query: Record<string, any>;
    skip: number;
    sort: Record<string, any>;
    limit: number;
  }): Promise<FetchAllPaginatedCoursesResult[]> {
    try {
      const courses = await this.courseModel.aggregate([
        { $match: query },
        {
          $lookup: {
            from: "categories",
            localField: "category",
            foreignField: "_id",
            as: "category",
          },
        },
        { $unwind: "$category" },
        {
          $lookup: {
            from: "users",
            localField: "userId",
            foreignField: "_id",
            as: "user",
          },
        },
        { $unwind: "$user" },
        {
          $lookup: {
            from: "reviews",
            localField: "_id",
            foreignField: "courseId",
            as: "reviews",
          },
        },
        {
          $addFields: {
            averageRating: {
              $cond: [
                { $gt: [{ $size: "$reviews" }, 0] },
                { $avg: "$reviews.rating" },
                0,
              ],
            },
            totalReviews: { $size: "$reviews" },
          },
        },
        {
          $project: {
            reviews: 0, // remove full reviews array if you don't need it
          },
        },
        { $sort: sort },
        { $skip: skip },
        { $limit: limit },
      ]);

      return courses;
    } catch (error: unknown) {
      console.log(error);
      throw new DatabaseError(
        "An unexpected database error occurred",
        StatusCode.INTERNAL_SERVER_ERROR
      );
    }
  }

  async findByIdWithPopulatedData(
    courseId: string
  ): Promise<CourseWithPopulatedFields | null> {
    try {
      const existingCourse = await this.courseModel
        .findById(courseId)
        .populate("category")
        .populate("userId")
        .lean();
      return existingCourse as CourseWithPopulatedFields | null;
    } catch (error: unknown) {
      throw new DatabaseError(
        "An unexpected database error occurred",
        StatusCode.INTERNAL_SERVER_ERROR
      );
    }
  }

  async findNewCourses(): Promise<CourseWithPopulatedCategory[]> {
    try {
      const newCourses = await this.courseModel
        .find({ status: "listed" })
        .populate<CourseDocument & { category: CategoryDocument }>("category")
        .sort({ createdAt: -1 })
        .limit(4)
        .lean();

      return newCourses;
    } catch (error: unknown) {
      throw new DatabaseError(
        "An unexpected database error occurred",
        StatusCode.INTERNAL_SERVER_ERROR
      );
    }
  }

  async findCourseByName(title: string): Promise<CourseDocument | null> {
    try {
      const existingCourse = await this.courseModel
        .findOne({ title: title })
        .lean();
      return existingCourse;
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.log(error.message);
      }
      throw new DatabaseError(
        "An unexpected database error occurred",
        StatusCode.INTERNAL_SERVER_ERROR
      );
    }
  }

  async fetchCoursesWithInstrucorIdAndStatus(
    instructorId: string,
    status: "pending" | "accepted" | "rejected" | "draft" | "listed"
  ): Promise<CourseDocument[]> {
    try {
      const courses = await this.courseModel
        .find({
          userId: instructorId,
          status: status,
        })
        .lean();
      return courses;
    } catch (error: unknown) {
      throw new DatabaseError(
        "An unexpected database error occurred",
        StatusCode.INTERNAL_SERVER_ERROR
      );
    }
  }

  async findCoursesWithFilter(
    filter: FilterQuery<CourseDocument>
  ): Promise<CourseWithPopulatedCategory[]> {
    try {
      const courses = await this.courseModel
        .find(filter)
        .populate<{ category: CategoryDocument }>("category")
        .lean();
      return courses;
    } catch (error: unknown) {
      throw new DatabaseError(
        "An unexpected database error occurred",
        StatusCode.INTERNAL_SERVER_ERROR
      );
    }
  }

  async changeCourseStatusWithInstructorIdAndCourseId(
    instructorId: string,
    courseId: string,
    status: string
  ): Promise<CourseDocument | null> {
    try {
      const course = await this.courseModel.findOneAndUpdate(
        { _id: courseId, userId: instructorId },
        { status: status, rejectedReason: "" },
        { new: true }
      );

      return course;
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.log(error.message);
      }
      throw new DatabaseError(
        "An unexpected database error occurred",
        StatusCode.INTERNAL_SERVER_ERROR
      );
    }
  }

  async countDocuments(key: string, value: string): Promise<number> {
    try {
      const count = await this.courseModel.countDocuments({ [key]: value });

      return count;
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.log(error.message);
      }
      throw new DatabaseError(
        "An unexpected database error occurred",
        StatusCode.INTERNAL_SERVER_ERROR
      );
    }
  }

  async toggleCourseStatus(courseId: string): Promise<CourseDocument | null> {
    try {
      const updatedCourse = await this.courseModel.findByIdAndUpdate(
        courseId,
        [{ $set: { isBlocked: { $not: "$isBlocked" } } }], // MongoDB toggle
        { new: true }
      );

      return updatedCourse;
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.log(error.message);
      }
      throw new DatabaseError(
        "An unexpected database error occurred",
        StatusCode.INTERNAL_SERVER_ERROR
      );
    }
  }

  async fetchPaginatedCoursesWithFilters(
    filters: Record<string, any>,
    skip: number,
    limit: number
  ): Promise<CourseWithPopulatedCategory[]> {
    try {
      const courses = await this.courseModel
        .find(filters)
        .populate<{ category: CategoryDocument }>("category")
        .skip(skip)
        .limit(limit)
        .lean();

      return courses;
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.log(error.message);
      }
      throw new DatabaseError(
        "An unexpected database error occurred",
        StatusCode.INTERNAL_SERVER_ERROR
      );
    }
  }

  async rejectCourseReviewRequest(
    courseId: string,
    rejectReason: string
  ): Promise<CourseDocument | null> {
    try {
      const updatedCourse = await this.courseModel.findByIdAndUpdate(
        courseId,
        { $set: { status: "rejected", rejectedReason: rejectReason } },
        { new: true }
      );
      return updatedCourse;
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.log(error.message);
      }
      throw new DatabaseError(
        "An unexpected database error occurred",
        StatusCode.INTERNAL_SERVER_ERROR
      );
    }
  }

  async approveCourseReviewRequest(
    courseId: string
  ): Promise<CourseDocument | null> {
    try {
      const updatedCourse = await this.courseModel.findByIdAndUpdate(
        courseId,
        { $set: { status: "accepted" }, $unset: { rejectedReason: "" } },
        { new: true }
      );
      return updatedCourse;
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.log(error.message);
      }
      throw new DatabaseError(
        "An unexpected database error occurred",
        StatusCode.INTERNAL_SERVER_ERROR
      );
    }
  }
}
