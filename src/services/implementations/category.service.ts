import { CategoryDocument } from "../../models/categoy.model";
import { ICategoryRepository } from "../../repositories/interfaces/category-repository.interface";
import { ICategoryService } from "../interfaces/category-service.interface";

export class CategoryService implements ICategoryService {
  constructor(private categoryRepository: ICategoryRepository) {}

  async getAllCategories(): Promise<CategoryDocument[] | null> {
    try {
      const categories = await this.categoryRepository.findAll();
      return categories;
    } catch (error) {
      throw error;
    }
  }
}
