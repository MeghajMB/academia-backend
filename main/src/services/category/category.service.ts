import { inject, injectable } from "inversify";
import { StatusCode } from "../../enums/status-code.enum";
import { ICategoryRepository } from "../../repositories/category/category.interface";
import { AppError } from "../../util/errors/app-error";
import { NotFoundError } from "../../util/errors/not-found-error";
import { ICategoryService } from "./category.interface";
import { GetAllCategoriesResponse } from "./category.types";
import { Types } from "../../container/types";

@injectable()
export class CategoryService implements ICategoryService {
  constructor(
    @inject(Types.CategoryRepository)
    private readonly categoryRepository: ICategoryRepository
  ) {}

  async getAllCategories(): Promise<GetAllCategoriesResponse[]> {
    try {
      const categories = await this.categoryRepository.findAll();
      const updatedCategories = categories.map((category) => {
        return {
          id: category._id.toString(),
          name: category.name,
          description: category.description,
          isBlocked: category.isBlocked,
          createdAt: category.createdAt.toISOString(),
          updatedAt: category.updatedAt.toISOString(),
        };
      });
      return updatedCategories;
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

  async blockCategory(categoryId: string) {
    try {
      const category = await this.categoryRepository.findById(categoryId);
      if (!category) {
        throw new NotFoundError("Category Not Found");
      }
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
}
