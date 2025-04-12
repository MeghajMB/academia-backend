// repository
import { IUserRepository } from "../../repositories/interfaces/user-repository.interface";
import { ICategoryRepository } from "../../repositories/interfaces/category-repository.interface";
import { ICourseRepository } from "../../repositories/interfaces/course-repository.interface";
//services
import { IAdminService } from "../interfaces/admin-service.interface";
//errors
import { AppError } from "../../util/errors/app-error";
import { NotFoundError } from "../../util/errors/not-found-error";
import { BadRequestError } from "../../util/errors/bad-request-error";
//externl dependencies
import { redis } from "../../lib/redis";
import { StatusCode } from "../../enums/status-code.enum";
import { INotificationService } from "../interfaces/notification-service.interface";
import {
  GetCoursesParams,
  GetCoursesResponse,
  GetInstructorVerificationRequestsParams,
  GetUsersParams,
  RejectVerificationRequestParams,
} from "../types/admin-service.types";

export class AdminService implements IAdminService {
  constructor(
    private userRepository: IUserRepository,
    private categoryRepository: ICategoryRepository,
    private courseRepository: ICourseRepository,
    private notificationService: INotificationService
  ) {}

  async getUsers({ role, page, limit, search }: GetUsersParams) {
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
      const pagination = {
        totalDocuments,
        totalPages: Math.ceil(totalDocuments / limit),
        currentPage: page,
        limit,
      };

      return { users, pagination };
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

    return { requests:updatedRequests, pagination };
  }

  async rejectVerificationRequest({
    rejectReason,
    userId,
  }: RejectVerificationRequestParams) {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new BadRequestError("User Not Found");
    }

    await this.userRepository.update(
      userId,
      { verified: "rejected", rejectedReason: rejectReason },
      {}
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
    const pagination = {
      totalDocuments,
      totalPages: Math.ceil(totalDocuments / limit),
      currentPage: page,
      limit,
    };

    return { categories, pagination };
  }

  async blockUser(userId: string) {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError();
    }
    await this.userRepository.update(
      userId,
      { isBlocked: !user.isBlocked },
      {}
    );
    if (user.isBlocked) {
      await redis.del(`refreshToken:${user.id}`);
    }
    return { message: user.isBlocked ? "User blocked" : "User unblocked" };
  }
  async blockOrUnblockCourse(id: string) {
    try {
      const course = await this.courseRepository.toggleCourseStatus(id);
      if (!course) {
        throw new AppError("Course not found", StatusCode.NOT_FOUND);
      }
      return {
        message: course.isBlocked ? "Course blocked" : "Course unblocked",
      };
    } catch (error) {
      throw error;
    }
  }

  async blockCategory(categoryId: string) {
    try {
      const category = await this.categoryRepository.findById(categoryId);
      if (!category) {
        throw new NotFoundError("Category Not Found");
      }
      category.isBlocked = !category.isBlocked;
      await this.categoryRepository.update(
        categoryId,
        { isBlocked: !category.isBlocked },
        {}
      );
      return {
        message: category.isBlocked ? "Category blocked" : "Category unblocked",
      };
    } catch (error) {
      throw error;
    }
  }

  async createCategory(category: { name: string; description: string }) {
    try {
      const existingCategory = await this.categoryRepository.findByName(
        category.name
      );
      if (existingCategory) {
        throw new AppError("Category already exists", StatusCode.CONFLICT);
      }
      const newCategory = await this.categoryRepository.createCategory(
        category
      );
      return newCategory;
    } catch (error) {
      throw error;
    }
  }
  async editCategory(
    category: { name: string; description: string },
    categoryId: string
  ) {
    try {
      const existingCategory = await this.categoryRepository.findById(
        categoryId
      );

      if (!existingCategory) {
        throw new AppError("Category doesn't exist", StatusCode.NOT_FOUND);
      }

      // Check if another category already exists with the same name
      const duplicateCategory = await this.categoryRepository.findByName(
        category.name
      );

      if (duplicateCategory && duplicateCategory.id !== categoryId) {
        throw new AppError(
          "Category with this name already exists",
          StatusCode.CONFLICT
        );
      }
      // Update the category
      const updatedCategory = await this.categoryRepository.update(
        categoryId,
        category,
        {}
      );
      if (!updatedCategory) {
        throw new AppError("Category not found", StatusCode.NOT_FOUND);
      }
      return {
        id: updatedCategory._id.toString(),
        name: updatedCategory.name,
        description: updatedCategory.description,
        isBlocked: updatedCategory.isBlocked,
      };
    } catch (error) {
      throw error;
    }
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
      const pagination = {
        totalDocuments,
        totalPages: Math.ceil(totalDocuments / limit),
        currentPage: page,
        limit,
      };

      return { requests, pagination };
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
        "course",
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
