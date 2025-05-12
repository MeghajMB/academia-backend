import { BadRequestError } from "../../util/errors/bad-request-error";
import { ICourseRepository } from "../../repositories/course/course.interface";
import mongoose, { Types } from "mongoose";
import { FileService } from "../file/file.service";
import { AppError } from "../../util/errors/app-error";
import { StatusCode } from "../../enums/status-code.enum";
import { ICourseService } from "./course.interface";
import { ILectureRepository } from "../../repositories/course/lecture/lecture.interface";
import { ISectionRepository } from "../../repositories/course/section/section.interface";
import { IEnrollmentRepository } from "../../repositories/enrollment/enrollment.interface";
import { CourseDocument } from "../../models/course.model";
import { EnrollmentDocument } from "../../models/enrollment.model";
import {
  CreateCourse,
  EditCourseLandingPagePayload,
  GetCourseAnalyticsResponse,
  GetCourseCreationDetailsResponse,
  GetCourseDetailsResponse,
  GetCourses,
  GetCoursesOfInstructorResponse,
  GetEnrolledCoursesOfUserResponse,
  UpdatedSection,
} from "./course.types";
import { Enrollment } from "../../repositories/enrollment/enrollment.types";
import { GetCoursesRequestDTO } from "../../controllers/course/request.dto";
import { IReviewRepository } from "../../repositories/review/review.interface";

export class CourseService implements ICourseService {
  constructor(
    private readonly courseRepository: ICourseRepository,
    private readonly lectureRepository: ILectureRepository,
    private readonly sectionRepository: ISectionRepository,
    private readonly enrollmentRepository: IEnrollmentRepository,
    private readonly fileService: FileService,
    private readonly reviewRepository: IReviewRepository
  ) {}
  async getCourseAnalytics(
    filter: "month" | "quarter" | "year",
    courseId: string,
    userId: string
  ): Promise<GetCourseAnalyticsResponse> {
    try {
      const now = new Date();
      const start = new Date();
      const end = new Date();

      switch (filter) {
        case "month":
          start.setFullYear(now.getFullYear(), 0, 1);
          end.setFullYear(now.getFullYear(), 11, 31);
          break;
        case "quarter":
          start.setFullYear(now.getFullYear(), 0, 1);
          end.setFullYear(now.getFullYear(), 11, 31);
          break;
        case "year":
          start.setFullYear(now.getFullYear() - 4, 0, 1);
          break;
      }

      const [courseMetrics, courseMetricsSummary] = await Promise.all([
        this.courseRepository.getAnalytics(
          courseId,
          userId,
          start,
          end,
          filter
        ),
        this.courseRepository.getAnalyticsSummary(courseId, userId),
      ]);

      const reviewDistribution = {
        1: 0,
        2: 0,
        3: 0,
        4: 0,
        5: 0,
      };
      courseMetricsSummary.reviews.forEach((review) => {
        const rating = review.rating;
        if (reviewDistribution[rating] !== undefined) {
          reviewDistribution[rating]++;
        }
      });

      const updatedCourseMetricsSummary = {
        totalRevenue: courseMetricsSummary.totalRevenue,
        totalStudents: courseMetricsSummary.totalStudents,
        averageProgress: courseMetricsSummary.averageProgress,
        averageRating: courseMetricsSummary.averageRating,
        reviewCount: courseMetricsSummary.reviewCount,
        reviewDistribution,
      };
      const updatedCourseMetrics = {
        enrollments: courseMetrics[0]?.enrollments || [],
        transactions: courseMetrics[0]?.transactions || [],
      };

      return {
        courseMetrics: updatedCourseMetrics,
        courseMetricsSummary: updatedCourseMetricsSummary,
      };
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async createCourse(
    courseData: CreateCourse,
    userId: string
  ): Promise<{ id: string }> {
    try {
      const existingCourse = await this.courseRepository.findCourseByName(
        courseData.title
      );
      if (existingCourse) {
        throw new BadRequestError("Course Already Exists");
      }
      const updatedCourseData = {
        ...courseData,
        userId: new Types.ObjectId(userId),
        category: new Types.ObjectId(courseData.category),
      };
      const newCourse = await this.courseRepository.create(updatedCourseData);

      if (!newCourse) {
        throw new BadRequestError("Course Creation Failed");
      }
      return { id: newCourse._id.toString() };
    } catch (error) {
      throw error;
    }
  }

  async getCourses({
    limit,
    category,
    page = "1",
    search,
    sort,
  }: GetCoursesRequestDTO): Promise<GetCourses> {
    try {
      const pageNum = parseInt(page) || 1;
      const skip = (pageNum - 1) * limit;

      const query: Record<any, any> = { status: "listed" };
      const sortQuery: Record<any, any> = {};
      if (category) {
        query.category = category;
      }
      if (search) {
        query.title = { $regex: search, $options: "i" };
      }
      switch (sort) {
        case "price:high":
          sortQuery.price = -1;
          break;
        case "price:low":
          sortQuery.price = 1;
          break;

        default:
          sortQuery.createdAt = -1;
          break;
      }
      const courses = await this.courseRepository.findAllPaginatedCourses({
        query,
        skip,
        sort: sortQuery,
        limit,
      });
      const totalDocuments = await this.courseRepository.countDocuments(
        "status",
        "listed"
      );
      const pagination = {
        totalDocuments,
        totalPages: Math.ceil(totalDocuments / limit),
        currentPage: Number(page),
        limit,
      };
      await Promise.all(
        courses.map(async (course) => {
          course.imageThumbnail = await this.fileService.generateGetSignedUrl(
            course.imageThumbnail
          );
        })
      );

      const updatedCourses = courses.map((course) => {
        return {
          id: course._id.toString(),
          instructorDetails: {
            name: course.user.name,
            id: course.user._id.toString(),
          },
          title: course.title,
          price: course.price,
          subtitle: course.subtitle,
          rating: course.averageRating,
          category: {
            name: course.category.name,
            id: course.category._id.toString(),
          },
          totalDuration: course.totalDuration,
          totalLectures: course.totalLectures,
          totalSections: course.totalSections,
          totalReviews: course.totalReviews,
          isBlocked: course.isBlocked,
          status: course.status,
          imageThumbnail: course.imageThumbnail,
          createdAt: course.createdAt.toISOString(),
          updatedAt: course.updatedAt.toISOString(),
        };
      });

      return {
        courses: updatedCourses,
        pagination,
      };
    } catch (error) {
      throw error;
    }
  }

  async enrollStudent(
    courseId: string,
    userId: string,
    transactionId: string
  ): Promise<EnrollmentDocument> {
    try {
      const listedCourse = await this.enrollmentRepository.create({
        courseId: new Types.ObjectId(courseId),
        studentId: new Types.ObjectId(userId),
        transactionId: new Types.ObjectId(transactionId),
      });
      return listedCourse;
    } catch (error) {
      throw error;
    }
  }

  async getCourseDetails(
    courseId: string,
    userId: string
  ): Promise<GetCourseDetailsResponse> {
    try {
      const course = await this.courseRepository.findByIdWithPopulatedData(
        courseId
      );

      if (!course || course.status !== "listed") {
        throw new BadRequestError("No course");
      }

      let enrollmentStatus: "enrolled" | "instructor" | "not enrolled";

      const enrolledCourse = await this.enrollmentRepository.findOneByFilter({
        courseId,
        studentId: userId,
      });
      const userReview = await this.reviewRepository.findByCourseAndStudent(
        course._id.toString(),
        userId
      );
      const hasReviewed = userReview ? true : false;
      if (course.userId._id.toString() == userId) {
        enrollmentStatus = "instructor";
      } else if (enrolledCourse) {
        enrollmentStatus = "enrolled";
      } else {
        enrollmentStatus = "not enrolled";
      }

      const image = await this.fileService.generateGetSignedUrl(
        course.imageThumbnail
      );
      const video = await this.fileService.generateGetSignedUrl(
        course.promotionalVideo
      );
      const sections = await this.sectionRepository.getSectionsWithCourseId(
        course._id.toString()
      );
      const lectures = await this.lectureRepository.getLecturesWithCourseId(
        course._id.toString()
      );

      const updatedSections = sections.map((section) => {
        return {
          id: section._id.toString(),
          title: section.title,
          order: section.order,
          lectures: lectures
            .filter(
              (lecture) =>
                lecture.sectionId.toString() == section._id.toString()
            )
            .map((lecture) => {
              return {
                id: lecture._id.toString(),
                title: lecture.title,
                order: lecture.order,
              };
            }),
        };
      });

      const courseDetails = {
        courseId: course._id.toString(),
        instructorId: course.userId._id.toString(),
        instructorName: course.userId.name,
        totalDuration: course.totalDuration,
        totalLectures: course.totalLectures,
        imageThumbnail: image,
        promotionalVideo: video,
        canReview: !!enrolledCourse,
        hasReviewed: hasReviewed,
        category: course.category.name,
        title: course.title,
        price: course.price,
        subtitle: course.subtitle,
        description: course.description,
        enrollmentStatus: enrollmentStatus,
        sections: updatedSections,
      };

      return courseDetails;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async editCourseCreationDetails(
    courseId: string,
    userId: string,
    courseData: EditCourseLandingPagePayload
  ): Promise<CourseDocument> {
    try {
      const course = await this.courseRepository.findById(courseId);

      if (!course) {
        throw new BadRequestError("No course");
      }
      if (course.userId.toString() !== userId) {
        throw new AppError(
          "You dont havve acces to this file",
          StatusCode.FORBIDDEN
        );
      }
      let updatedData: {
        category: mongoose.Types.ObjectId;
        description: string;
        price: number;
        subtitle: string;
        title: string;
        imageThumbnail?: string;
        promotionalVideo?: string;
      } = {
        category: new mongoose.Types.ObjectId(courseData.category),
        description: courseData.description,
        price: courseData.price,
        subtitle: courseData.subtitle,
        title: courseData.title,
      };

      if (courseData.imageThumbnail) {
        updatedData.imageThumbnail = courseData.imageThumbnail;
      }
      if (courseData.promotionalVideo) {
        updatedData.imageThumbnail = courseData.promotionalVideo;
      }
      const updatedCourse = await this.courseRepository.update(
        courseId,
        updatedData,
        {}
      );

      return updatedCourse;
    } catch (error) {
      throw error;
    }
  }

  async getCourseCreationDetails(
    courseId: string,
    userId: string
  ): Promise<GetCourseCreationDetailsResponse> {
    const course = await this.courseRepository.findByIdWithPopulatedData(
      courseId
    );

    if (!course) {
      throw new BadRequestError("No course");
    }
    if (course.userId._id.toString() !== userId) {
      throw new AppError(
        "You dont havve acces to this file",
        StatusCode.FORBIDDEN
      );
    }
    const sectionCount = await this.sectionRepository.countDocumentsByCourseId(
      courseId
    );
    const image = await this.fileService.generateGetSignedUrl(
      course.imageThumbnail
    );
    const video = await this.fileService.generateGetSignedUrl(
      course.promotionalVideo
    );

    const courseDetails = {
      courseId: course._id.toString(),
      imageThumbnail: image,
      promotionalVideo: video,
      category: course.category._id.toString(),
      title: course.title,
      price: course.price,
      subtitle: course.subtitle,
      description: course.description,
      rejectedReason: course.rejectedReason,
      canSubmitReview: sectionCount
        ? course.status !== "listed" && course.status !== "pending"
          ? true
          : false
        : false,
    };

    return courseDetails;
  }

  async getNewCourses(): Promise<
    {
      id: string;
      userId: string;
      title: string;
      price: number;
      subtitle: string;
      description: string;
      category: {
        description: string;
        name: string;
      };
      totalDuration: number;
      totalLectures: number;
      totalSections: number;
      isBlocked: boolean;
      status: string;
      imageThumbnail: string;
      createdAt: string;
      updatedAt: string;
    }[]
  > {
    try {
      const courses = await this.courseRepository.findNewCourses();
      if (!courses) {
        throw new BadRequestError("No new courses available");
      }

      await Promise.all(
        courses.map(async (course) => {
          course.imageThumbnail = await this.fileService.generateGetSignedUrl(
            course.imageThumbnail
          );
        })
      );
      const updatedCourse = courses.map((course) => {
        return {
          id: course._id.toString(),
          userId: course.userId.toString(),
          title: course.title,
          price: course.price,
          subtitle: course.subtitle,
          description: course.description,
          category: {
            description: course.category.description,
            name: course.category.name,
          },
          totalDuration: course.totalDuration,
          totalLectures: course.totalLectures,
          totalSections: course.totalSections,
          isBlocked: course.isBlocked,
          status: course.status,
          imageThumbnail: course.imageThumbnail,
          createdAt: course.createdAt.toISOString(),
          updatedAt: course.updatedAt.toISOString(),
        };
      });
      return updatedCourse;
    } catch (error) {
      throw error;
    }
  }

  async getEnrolledCoursesOfUser(
    studentId: string
  ): Promise<GetEnrolledCoursesOfUserResponse[]> {
    try {
      const enrolledCourses = await this.enrollmentRepository.findByStudentId(
        studentId
      );
      let updatedEnrolledCourses = await Promise.all(
        enrolledCourses.map(async (enrolledCourse) => {
          let imageUrl = await this.fileService.generateGetSignedUrl(
            enrolledCourse.courseId.imageThumbnail
          );
          return {
            id: enrolledCourse.courseId._id.toString(),
            imageThumbnail: imageUrl,
            title: enrolledCourse.courseId.title,
            completedAt: enrolledCourse.completedAt?.toISOString() || null,
            progressPercentage: enrolledCourse.progress.percentage,
            certificate: enrolledCourse.certificateUrl || null,
          };
        })
      );

      return updatedEnrolledCourses;
    } catch (error) {
      throw error;
    }
  }

  async getCurriculum(
    courseId: string,
    userId: string,
    status: string,
    role: string
  ): Promise<UpdatedSection[]> {
    try {
      const existingCourse = await this.courseRepository.findById(courseId);

      if (status == "instructor") {
        if (existingCourse?.userId.toString() !== userId) {
          throw new AppError(
            "You dont have access to this file",
            StatusCode.FORBIDDEN
          );
        }
      }
      let enrolledCourse: Enrollment | null;
      if (status == "student" && existingCourse?.userId.toString() !== userId) {
        enrolledCourse = await this.enrollmentRepository.findOneByFilter({
          courseId: courseId,
          studentId: userId,
        });

        if (!enrolledCourse) {
          throw new AppError(
            "You dont have access to this course",
            StatusCode.FORBIDDEN
          );
        }
      }
      const sections = await this.sectionRepository.getSectionsWithCourseId(
        courseId
      );

      const lectures = await this.lectureRepository.getLecturesWithCourseId(
        courseId
      );
      //change the lecture and sections to curriculum
      const curriculum = sections.map((section) => ({
        id: section._id.toString(),
        courseId: section.courseId.toString(),
        title: section.title,
        order: section.order,
        description: section.description,
        lectures: lectures
          .filter(
            (lecture) => lecture.sectionId.toString() === section._id.toString()
          )
          .map((lecture) => ({
            id: lecture._id.toString(),
            sectionId: lecture.sectionId.toString(),
            courseId: lecture.courseId.toString(),
            title: lecture.title,
            videoUrl: lecture.videoUrl,
            duration: lecture.duration,
            order: lecture.order,
            status: lecture.status,
            progress:
              status == "instructor"
                ? "instructor"
                : enrolledCourse?.progress.completedLectures.includes(
                    lecture._id as Types.ObjectId
                  )
                ? "completed"
                : "not completed",
          })),
      }));

      return curriculum;
    } catch (error) {
      throw error;
    }
  }

  async getCoursesOfInstructor(
    instructorId: string,
    status: string
  ): Promise<GetCoursesOfInstructorResponse[]> {
    if (
      status !== "pending" &&
      status !== "accepted" &&
      status !== "rejected" &&
      status !== "draft" &&
      status !== "all"
    ) {
      throw new BadRequestError("enter a valid status");
    }
    let filter: { userId: string; status?: string } = { userId: instructorId };

    if (status !== "all") {
      filter.status = status;
    }

    const courses = await this.courseRepository.findCoursesWithFilter(filter);

    const updatedCourses = courses.map((course) => {
      return {
        id: course._id.toString(),
        userId: course.userId.toString(),
        title: course.title,
        price: course.price,
        subtitle: course.subtitle,
        description: course.description,
        category: {
          description: course.category.description,
          name: course.category.name,
        },
        totalDuration: course.totalDuration,
        totalLectures: course.totalLectures,
        totalSections: course.totalSections,
        isBlocked: course.isBlocked,
        status: course.status,
        rejectedReason: course.rejectedReason,
        imageThumbnail: course.imageThumbnail,
        promotionalVideo: course.promotionalVideo,
        createdAt: course.createdAt.toISOString(),
        updatedAt: course.updatedAt.toISOString(),
      };
    });

    return updatedCourses;
  }

  async submitCourseForReview(
    instructorId: string,
    courseId: string
  ): Promise<{ message: string }> {
    try {
      const status = "pending";
      const course =
        await this.courseRepository.changeCourseStatusWithInstructorIdAndCourseId(
          instructorId,
          courseId,
          status
        );
      if (!course) {
        throw new BadRequestError("No course");
      }
      return { message: "success" };
    } catch (error) {
      throw error;
    }
  }

  async listCourse(
    instructorId: string,
    courseId: string
  ): Promise<{ message: string }> {
    try {
      const status = "listed";
      const existingCourse = await this.courseRepository.findById(courseId);
      if (existingCourse?.status !== "accepted") {
        throw new BadRequestError("The course is not approved");
      }
      if (existingCourse?.userId.toString() !== instructorId) {
        throw new AppError(
          "You dont have access to this course",
          StatusCode.FORBIDDEN
        );
      }
      const course =
        await this.courseRepository.changeCourseStatusWithInstructorIdAndCourseId(
          instructorId,
          courseId,
          status
        );
      if (!course) {
        throw new BadRequestError("No course");
      }
      return { message: "success" };
    } catch (error) {
      throw error;
    }
  }
}
