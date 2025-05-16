import { Document } from "mongoose";
import { IRepository } from "../base/base.interface";
import { CategoryDocument } from "../../models/categoy.model";

export interface ICategoryRepository extends IRepository<CategoryDocument> {
  createCategory(category: {
    name: string;
    description: string;
  }): Promise<CategoryDocument>;
  fetchCategoryWithPagination(
    skip: number,
    limit: number
  ): Promise<CategoryDocument[]>;
  findByName(name: string): Promise<CategoryDocument | null>;
  updateCategory(
    categoryId: string,
    updatedData: { name: string; description: string }
  ): Promise<CategoryDocument | null>;
}
