import { IUserRepository } from "../../repositories/user/user.interface";
import { ICategoryRepository } from "../../repositories/category/category.interface";
import { ICourseRepository } from "../../repositories/course/course.interface";
import { IAdminService } from "./admin.interface";
import { BadRequestError } from "../../util/errors/bad-request-error";
import { INotificationService } from "../notification/notification.interface";
import {
  GetCoursesParams,
  GetCoursesResponse,
  GetInstructorVerificationRequestsParams,
  GetUsersParams,
  GetUsersResponse,
  RejectVerificationRequestParams,
} from "./admin.types";
import { inject, injectable } from "inversify";
import { Types } from "../../container/types";
import moment from "moment";
import { ITransactionRepository } from "../../repositories/transaction/transaction.interface";
import { IEnrollmentRepository } from "../../repositories/enrollment/enrollment.interface";
import { ISessionRepository } from "../../repositories/session/session.interface";
import { IReviewRepository } from "../../repositories/review/review.interface";

@injectable()
export class AdminService implements IAdminService {
  constructor(
    @inject(Types.UserRepository)
    private readonly userRepository: IUserRepository,
    @inject(Types.CategoryRepository)
    private readonly categoryRepository: ICategoryRepository,
    @inject(Types.CourseRepository)
    private readonly courseRepository: ICourseRepository,
    @inject(Types.NotificationService)
    private readonly notificationService: INotificationService,
    @inject(Types.TransactionRepository)
    private readonly transactionRepository: ITransactionRepository,
    @inject(Types.EnrollmentRepository)
    private readonly enrollmentRepository: IEnrollmentRepository,
    @inject(Types.SessionRepository)
    private readonly sessionRepository: ISessionRepository,
    @inject(Types.ReviewRepository)
    private readonly reviewRepository: IReviewRepository
  ) {}

  async fetchAnalytics(
    filter: "month" | "quarter" | "year" | "custom",
    startDate: string | undefined,
    endDate: string | undefined
  ): Promise<any> {
    let matchStage: Record<string, any>;
    let dateGroup: "daily" | "monthly" | "yearly" = "daily";
    switch (filter) {

      case "month":
        matchStage = {
          createdAt: {
            $gte: moment().startOf("year").toDate(),
            $lt: moment().endOf("year").toDate(),
          },
        };
        dateGroup = "daily";
        break;

      case "quarter":
        matchStage = {
          createdAt: {
            $gte: moment().startOf("year").toDate(),
            $lt: moment().endOf("year").toDate(),
          },
        };
        dateGroup = "monthly";
        break;

      case "year":
        matchStage = {
          createdAt: {
            $gte: moment().startOf("year").toDate(),
            $lt: moment().endOf("year").toDate(),
          },
        };
        dateGroup = "monthly";
        break;

      case "custom":
        if (!startDate || !endDate) {
          throw new Error(
            "startDate and endDate are required for custom filter"
          );
        }
        const start = moment(startDate);
        const end = moment(endDate);
        if (!start.isValid() || !end.isValid()) {
          throw new Error(
            "Invalid startDate or endDate"
          );
        }
        matchStage = {
          createdAt: {
            $gte: start.startOf("day").toDate(),
            $lt: end.endOf("day").toDate(),
          },
        };
        const rangeDays = end.diff(start, "days");
        if (rangeDays > 365) {
          dateGroup = "monthly";
        } else {
          dateGroup = "daily";
        }
        break;

      default:
        matchStage = {};
    }
    const [transactionData, enrollmentData, sessionData, reviewData] =
      await Promise.all([
        this.transactionRepository.fetchAdminTransactionAnalytics(
          matchStage,
          dateGroup
        ),
        this.enrollmentRepository.fetchAdminEnrollmentAnalytics(
          matchStage,
          dateGroup
        ),
        this.sessionRepository.fetchAdminSessionAnalytics(
          matchStage,
          dateGroup
        ),
        this.reviewRepository.fetchAdminReviewAnalytics(matchStage, dateGroup),
      ]);

    const reviewSummary = {
      averageRating: reviewData[0]?.averageRating || 0,
      totalReviews: reviewData[0]?.totalReviews || 0,
    };
    const defaultDistribution: Record<1 | 2 | 3 | 4 | 5, number> = {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
    };

    const reviewDistribution: Record<1 | 2 | 3 | 4 | 5, number> =
      reviewData?.[0]?.ratings.reduce(
        (acc, review) => {
          acc[review.rating] = review.count;
          return acc;
        },
        { ...defaultDistribution }
      ) ?? defaultDistribution;

    const finalResult = {
      transaction: {
        summary: transactionData.summary,
        metrics: transactionData.metrics,
      },
      enrollment: {
        summary: enrollmentData.summary,
        metrics: enrollmentData.metrics,
      },
      session: { summary: sessionData.summary, metrics: sessionData.metrics },
      review: {
        summary: reviewSummary,
        distribution: reviewDistribution,
      },
    };

    return finalResult;
  }

  async getUsers({
    role,
    page,
    limit,
    search,
  }: GetUsersParams): Promise<GetUsersResponse> {
    try {
      const skip = (page - 1) * limit;
      const totalDocuments = await this.userRepository.countDocuments(
        "role",
        role
      );
      const users = await this.userRepository.fetchUsersWithPagination(
        skip,
        limit,
        role,
        search
      );
      const updatedUsers = users.map((user) => {
        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          profilePicture: user.profilePicture,
          isBlocked: user.isBlocked,
        };
      });
      const pagination = {
        totalDocuments,
        totalPages: Math.ceil(totalDocuments / limit),
        currentPage: page,
        limit,
      };

      return { users: updatedUsers, pagination };
    } catch (error) {
      throw error;
    }
  }

  async getCourses({
    page,
    limit,
    search,
  }: GetCoursesParams): Promise<GetCoursesResponse> {
    const skip = (page - 1) * limit;
    const totalDocuments = await this.courseRepository.countDocuments(
      "status",
      "listed"
    );
    const filters = {
      status: "listed",
    };
    const courses =
      await this.courseRepository.fetchPaginatedCoursesWithFilters(
        filters,
        skip,
        limit
      );
    const pagination = {
      totalDocuments,
      totalPages: Math.ceil(totalDocuments / limit),
      currentPage: page,
      limit,
    };
    const updatedCourses = courses.map((course) => {
      return {
        id: course._id.toString(),
        title: course.title,
        price: course.price,
        isBlocked: course.isBlocked,
        category: {
          name: course.category.name,
          description: course.category.description,
        },
        status: course.status,
      };
    });

    return { courses: updatedCourses, pagination };
  }

  async getInstructorVerificationRequests({
    page,
    limit,
  }: GetInstructorVerificationRequestsParams) {
    const skip = (page - 1) * limit;
    const totalDocuments = await this.userRepository.countDocuments(
      "verified",
      "pending"
    );
    const filters = { verified: "pending" };
    const requests = await this.userRepository.fetchUsersWithFilters(
      filters,
      skip,
      totalDocuments
    );
    const pagination = {
      totalDocuments,
      totalPages: Math.ceil(totalDocuments / limit),
      currentPage: page,
      limit,
    };
    const updatedRequests = requests?.map((request) => {
      return {
        id: request._id.toString(),
        name: request.name,
        email: request.email,
        profilePicture: request.profilePicture,
        isBlocked: request.isBlocked,
        verified: request.verified,
      };
    });

    return { requests: updatedRequests, pagination };
  }

  async rejectVerificationRequest({
    rejectReason,
    userId,
  }: RejectVerificationRequestParams) {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new BadRequestError("User Not Found");
    }

    await this.userRepository.update(userId, { verified: "rejected" }, {});
    await this.notificationService.sendNotification(
      userId,
      "system",
      "Instructor Request Rejected",
      rejectReason
    );
    return { message: "Verification request rejected" };
  }

  async approveVerificationRequest(userId: string) {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new BadRequestError("User Not Found");
    }
    this.userRepository.update(
      userId,
      { verified: "verified", role: "instructor" },
      { rejectedReason: 1 }
    );

    return { message: "Verification request approved" };
  }

  async getPaginatedCategories(page: number, limit: number) {
    const skip = (page - 1) * limit;
    const totalDocuments = await this.categoryRepository.countAll();
    const categories =
      await this.categoryRepository.fetchCategoryWithPagination(skip, limit);
    const updatedCategories = categories.map((category) => {
      return {
        id: category._id.toString(),
        name: category.name,
        description: category.description,
        isBlocked: category.isBlocked,
      };
    });
    const pagination = {
      totalDocuments,
      totalPages: Math.ceil(totalDocuments / limit),
      currentPage: page,
      limit,
    };

    return { categories: updatedCategories, pagination };
  }

  async getCourseReviewRequests(page: number, limit: number) {
    try {
      const skip = (page - 1) * limit;
      const totalDocuments = await this.courseRepository.countDocuments(
        "status",
        "pending"
      );
      const filters = { status: "pending" };
      const requests =
        await this.courseRepository.fetchPaginatedCoursesWithFilters(
          filters,
          skip,
          totalDocuments
        );
      const updatedRequests = requests.map((request) => {
        return {
          id: request._id.toString(),
          price: request.price,
          title: request.title,
          isBlocked: request.isBlocked,
          category: {
            name: request.category.name,
            description: request.category.description,
          },
        };
      });
      const pagination = {
        totalDocuments,
        totalPages: Math.ceil(totalDocuments / limit),
        currentPage: page,
        limit,
      };

      return { requests: updatedRequests, pagination };
    } catch (error) {
      throw error;
    }
  }

  async rejectCourseReviewRequest(rejectReason: string, courseId: string) {
    try {
      const course = await this.courseRepository.rejectCourseReviewRequest(
        courseId,
        rejectReason
      );
      if (!course) throw new BadRequestError("No course found");
      await this.notificationService.sendNotification(
        course?.userId.toString(),
        "system",
        "Course Rejected",
        rejectReason,
        courseId
      );
      return { message: "success" };
    } catch (error) {
      throw error;
    }
  }

  async approveCourseReviewRequest(courseId: string) {
    try {
      const course = await this.courseRepository.approveCourseReviewRequest(
        courseId
      );
      return { message: "success" };
    } catch (error) {
      throw error;
    }
  }
}
