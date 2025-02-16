import {
  ICategory,
  ICategoryRepository,
  ICategoryResult,
} from "./interfaces/ICategoryRepository";
import { CategoryModel } from "../models/categoyModel";
import { DatabaseError } from "../errors/database-error";
import { StatusCode } from "../enums/statusCode.enum";

export class CategoryRepository implements ICategoryRepository {
  async createCategory(category: ICategory): Promise<ICategoryResult | null> {
    try {
      const createdCategory = new CategoryModel(category);
      const newCategory = await createdCategory.save();
      return newCategory;
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.log(error.message);
      }
      throw new DatabaseError("An unexpected database error occurred", StatusCode.INTERNAL_SERVER_ERROR);
    }
  }

  async fetchCategoryWithPagination(
    skip: number,
    limit: number
  ): Promise<ICategoryResult[] | null> {
    try {
      const category = await CategoryModel.find()
        .skip(skip)
        .limit(limit)
        .sort({ name: 1 });
      if (!category) return null;

      return category;
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.log(error.message);
      }
      throw new DatabaseError("An unexpected database error occurred", StatusCode.INTERNAL_SERVER_ERROR);
    }
  }

  async getAllCategories(): Promise<ICategoryResult[] | null> {
    try {
      const categories = await CategoryModel.find();
      return categories;
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.log(error.message);
      }
      throw new DatabaseError("An unexpected database error occurred", StatusCode.INTERNAL_SERVER_ERROR);
    }
  }

  async findByName(name: string): Promise<ICategoryResult | null> {
    try {
      const category = await CategoryModel.findOne({
        name: { $regex: `^${name}$`, $options: "i" },
      });
      if (!category) return null;

      return category;
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.log(error.message);
      }
      throw new DatabaseError("An unexpected database error occurred", StatusCode.INTERNAL_SERVER_ERROR);
    }
  }

  async findById(id: string): Promise<ICategoryResult | null> {
    try {
      const category = await CategoryModel.findById(id);
      if (!category) return null;

      return category;
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.log(error.message);
      }
      throw new DatabaseError("An unexpected database error occurred", StatusCode.INTERNAL_SERVER_ERROR);
    }
  }
  async updateCategory(
    categoryId: string,
    updatedData: { name: string; description: string }
  ): Promise<ICategoryResult|null> {
    try {
      const updatedCategory = await CategoryModel.findByIdAndUpdate(
        categoryId,
        { $set: updatedData },
        { new: true }
      );

      if (!updatedCategory) {
        return null;
      }

      return updatedCategory;
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.log(error.message);
      }
      throw new DatabaseError("An unexpected database error occurred", StatusCode.INTERNAL_SERVER_ERROR);
    }
  }

  async save(category: ICategoryResult): Promise<ICategoryResult | null> {
    try {
      return await category.save();
    } catch (error: unknown) {
      throw new DatabaseError("An unexpected database error occurred", StatusCode.INTERNAL_SERVER_ERROR);
    }
  }

  async countDocuments(): Promise<number> {
    try {
      const count = await CategoryModel.countDocuments();
      return count;
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.log(error.message);
      }
      throw new DatabaseError("An unexpected database error occurred", StatusCode.INTERNAL_SERVER_ERROR);
    }
  }
}
