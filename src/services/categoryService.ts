// src/services/categoryService.ts
import { StatusCode } from "../enums/statusCode.enum";
import { AppError } from "../errors/app-error";
import { CategoryRepository } from "../repositories/categoryRepository";

export class CategoryService {
  constructor(private categoryRepository: CategoryRepository) {}

  async getAllCategories() {
    const categories = await this.categoryRepository.getAllCategories();
    return categories;
  }
}
