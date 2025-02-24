// repository
import { IUserRepository } from "../repositories/interfaces/IUserRepository";
import { ICategoryRepository } from "../repositories/interfaces/ICategoryRepository";
import { ICourseRepository } from "../repositories/interfaces/ICourseRepository";

//services
import { IAdminService } from "./interfaces/IAdminService";

//errors
import { AppError } from "../errors/app-error";
import { NotFoundError } from "../errors/not-found-error";
import { BadRequestError } from "../errors/bad-request-error";

//externl dependencies
import { redis } from "../config/redisClient";
import { StatusCode } from "../enums/statusCode.enum";

export class AdminService implements IAdminService {
  constructor(
    private userRepository: IUserRepository,
    private categoryRepository: ICategoryRepository,
    private courseRepository: ICourseRepository
  ) {}

  async getUsers(role: string, page: number, limit: number, search: string) {
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
  }
  async getCourses(page: number, limit: number, search: string) {
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

    return { courses, pagination };
  }

  async getInstructorVerificationRequests(page: number, limit: number) {
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

    return { requests, pagination };
  }

  async rejectVerificationRequest(rejectReason: string, userId: string) {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new BadRequestError("User Not Found");
    }

    user.verified = "rejected";
    user.rejectedReason = rejectReason;
    await this.userRepository.save(user);

    return user;
  }

  async approveVerificationRequest(userId: string) {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new BadRequestError("User Not Found");
    }

    user.verified = "verified";
    delete user.rejectedReason;
    user.role = "instructor";
    await this.userRepository.save(user);

    return user;
  }

  async getPaginatedCategories(page: number, limit: number) {
    const skip = (page - 1) * limit;
    const totalDocuments = await this.categoryRepository.countDocuments();
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

  async blockUser(id: string) {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new NotFoundError();
    }
    user.isBlocked = !user.isBlocked;
    await this.userRepository.save(user);
    if (user.isBlocked) {
      await redis.del(`refreshToken:${user.id}`);
    }
    return user;
  }
  async blockOrUnblockCourse(id: string) {
    try {
      const course = await this.courseRepository.toggleCourseStatus(id);
      if(!course){
        throw new AppError("Course not found",StatusCode.NOT_FOUND)
      }
      return course;
    } catch (error) {
      throw error;
    }
  }

  async blockCategory(id: string) {
    try {
      const category = await this.categoryRepository.findById(id);
      if (!category) {
        throw new NotFoundError("Category Not Found");
      }
      category.isBlocked = !category.isBlocked;
      await this.categoryRepository.save(category);
      return category;
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
      const updatedCategory = await this.categoryRepository.updateCategory(
        categoryId,
        category
      );
      if (!updatedCategory) {
        throw new AppError("Category not found", StatusCode.NOT_FOUND);
      }
      return updatedCategory;
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
      const reviewRequests =
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

      return { reviewRequests, pagination };
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
