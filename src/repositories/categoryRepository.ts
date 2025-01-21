import {
  ICategory,
  ICategoryRepository,
  ICategoryResult,
} from "./interfaces/categoryRepository";
import { CategoryModel } from "../models/categoyModel";

export class CategoryRepository implements ICategoryRepository {
  async createCategory(category: ICategory): Promise<ICategoryResult | null> {
    const createdCategory = new CategoryModel(category);
    const newCategory = await createdCategory.save();
    return newCategory;
  }
  
  async fetchCategoryWithPagination(
    skip: number,
    limit: number
  ): Promise<ICategoryResult[] | null> {
    const category = await CategoryModel.find()
      .skip(skip)
      .limit(limit)
      .sort({ name: 1 });
    if (!category) return null;

    return category;
  }

  async getAllCategories(): Promise<ICategoryResult[] | null>{
    const categories=await CategoryModel.find();
    return categories
  }

  async findByName(name: string): Promise<ICategoryResult | null> {
    const category = await CategoryModel.findOne({name: { $regex: `^${name}$`, $options: "i" },});
    if (!category) return null;

    return category;
  }

  async findById(id:string): Promise<ICategoryResult | null>{
    const category = await CategoryModel.findById(id);
    if (!category) return null;

    return category;
  }

  async save(category:ICategoryResult): Promise<ICategoryResult | null>{
    return await category.save();
  }

  async countDocuments(): Promise<number> {
    const count = await CategoryModel.countDocuments();
    return count;
  }
}
