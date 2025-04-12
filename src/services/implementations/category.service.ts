import { CategoryDocument } from "../../models/categoy.model";
import { ICategoryRepository } from "../../repositories/interfaces/category-repository.interface";
import { ICategoryService } from "../interfaces/category-service.interface";
import { GetAllCategoriesResponse } from "../types/category-service.types";

export class CategoryService implements ICategoryService {
  constructor(private categoryRepository: ICategoryRepository) {}

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
