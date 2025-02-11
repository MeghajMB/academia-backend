// src/services/AuthService.ts
import { UserRepository } from "../repositories/userRepository";
import { CategoryRepository } from "../repositories/categoryRepository";
//services

import { transporter } from "../util/emailClient";
import { redis } from "../config/redisClient";

//errors
import { AppError } from "../errors/app-error";

//externl dependencies
import validator from "validator";
import { StatusCode } from "../enums/statusCode.enum";
import { NotFoundError } from "../errors/not-found-error";
import { BadRequestError } from "../errors/bad-request-error";

export class AdminService {
  constructor(
    private userRepository: UserRepository,
    private categoryRepository: CategoryRepository
  ) {}

  async getUsers(role: string, page: number, limit: number) {
    const skip = (page - 1) * limit;
    const totalDocuments = await this.userRepository.countDocuments(
      "role",
      role
    );
    const users = await this.userRepository.fetchUsersWithPagination(
      skip,
      limit,
      role
    );
    const pagination = {
      totalDocuments,
      totalPages: Math.ceil(totalDocuments / limit),
      currentPage: page,
      limit,
    };

    return { users, pagination };
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

  async blockCategory(id: string) {
    const category = await this.categoryRepository.findById(id);
    if (!category) {
      throw new NotFoundError("Category Not Found");
    }
    category.isBlocked = !category.isBlocked;
    await this.categoryRepository.save(category);
    return category;
  }

  async createCategory(category: { name: string; description: string }) {
    const existingCategory = await this.categoryRepository.findByName(
      category.name
    );
    if (existingCategory) {
      throw new AppError("Category already exists", StatusCode.CONFLICT);
    }
    const newCategory = await this.categoryRepository.createCategory(category);
    return newCategory;
  }
  async editCategory(
    category: { name: string; description: string },
    categoryId: string
  ) {
    const existingCategory = await this.categoryRepository.findById(categoryId);

    if (!existingCategory) {
      throw new AppError("Category doesn't exist", StatusCode.NOT_FOUND);
    }
  
    // Check if another category already exists with the same name
    const duplicateCategory = await this.categoryRepository.findByName(category.name);
  
    if (duplicateCategory && duplicateCategory.id !== categoryId) {
      throw new AppError("Category with this name already exists", StatusCode.CONFLICT);
    }
  
    // Update the category
    const updatedCategory = await this.categoryRepository.updateCategory(
      categoryId,
      category
    );
    if(!updatedCategory){
      throw new AppError("Category not found", StatusCode.NOT_FOUND);
    }
    return updatedCategory;
  }
}
