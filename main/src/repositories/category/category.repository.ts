import { StatusCode } from "../../enums/status-code.enum";
import { DatabaseError } from "../../util/errors/database-error";
import { CategoryDocument, CategoryModel } from "../../models/categoy.model";
import { ICategoryRepository } from "./category.interface";
import { BaseRepository } from "../base/base.repository";
import { inject, injectable } from "inversify";
import { Types } from "../../container/types";
import { Model } from "mongoose";

@injectable()
export class CategoryRepository
  extends BaseRepository<CategoryDocument>
  implements ICategoryRepository
{
  constructor(
    @inject(Types.CategoryModel)
    private readonly categoryModel: Model<CategoryDocument>
  ) {
    super(categoryModel);
  }
  async createCategory(category: {
    name: string;
    description: string;
  }): Promise<CategoryDocument> {
    try {
      const createdCategory = new this.categoryModel(category);
      const newCategory = await createdCategory.save();
      return newCategory;
    } catch (error: unknown) {
      console.error(error);
      throw new DatabaseError(
        "An unexpected database error occurred",
        StatusCode.INTERNAL_SERVER_ERROR
      );
    }
  }

  async fetchCategoryWithPagination(
    skip: number,
    limit: number
  ): Promise<CategoryDocument[]> {
    try {
      const category = await this.categoryModel.find()
        .skip(skip)
        .limit(limit)
        .sort({ name: 1 })
        .lean();

      return category;
    } catch (error: unknown) {
      console.error(error);
      throw new DatabaseError(
        "An unexpected database error occurred",
        StatusCode.INTERNAL_SERVER_ERROR
      );
    }
  }

  async findByName(name: string): Promise<CategoryDocument | null> {
    try {
      const category = await this.categoryModel.findOne({
        name: { $regex: `^${name}$`, $options: "i" },
      }).lean();
      if (!category) return null;

      return category;
    } catch (error: unknown) {
      console.error(error);
      throw new DatabaseError(
        "An unexpected database error occurred",
        StatusCode.INTERNAL_SERVER_ERROR
      );
    }
  }

  async updateCategory(
    categoryId: string,
    updatedData: { name: string; description: string }
  ): Promise<CategoryDocument | null> {
    try {
      const updatedCategory = await this.categoryModel.findByIdAndUpdate(
        categoryId,
        { $set: updatedData },
        { new: true }
      );

      if (!updatedCategory) {
        return null;
      }
      return updatedCategory;
    } catch (error: unknown) {
      console.error(error);
      throw new DatabaseError(
        "An unexpected database error occurred",
        StatusCode.INTERNAL_SERVER_ERROR
      );
    }
  }
}
