import {
  ICategoryRepository,
  ICategoryResult,
} from "../../repositories/interfaces/category-repository.interface";
import { ICategoryService } from "../interfaces/category-service.interface";

export class CategoryService implements ICategoryService {
  constructor(private categoryRepository: ICategoryRepository) {}

  async getAllCategories(): Promise<ICategoryResult[] | null> {
    try {
      const categories = await this.categoryRepository.getAllCategories();
      return categories;
    } catch (error) {
      throw error;
    }
  }
}
