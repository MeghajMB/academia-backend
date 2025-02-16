// src/services/categoryService.ts
import { StatusCode } from "../enums/statusCode.enum";
import { AppError } from "../errors/app-error";
import { CategoryRepository } from "../repositories/categoryRepository";
import { ICategoryRepository, ICategoryResult } from "../repositories/interfaces/ICategoryRepository";
import { ICategoryService } from "./interfaces/ICategoryService";

export class CategoryService implements ICategoryService {
  constructor(private categoryRepository: ICategoryRepository) {}

  async getAllCategories() :Promise<ICategoryResult[]|null> {
    const categories = await this.categoryRepository.getAllCategories();
    return categories;
  }
}
