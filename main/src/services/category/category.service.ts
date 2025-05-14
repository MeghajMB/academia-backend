import { CategoryDocument } from "../../models/categoy.model";
import { ICategoryRepository } from "../../repositories/category/category.interface";
import { ICategoryService } from "./category.interface";
import { GetAllCategoriesResponse } from "./category.types";

export class CategoryService implements ICategoryService {
  constructor(private readonly categoryRepository: ICategoryRepository) {}

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
}
