import { GetAllCategoriesResponse } from "../types/category-service.types";

export interface ICategoryService {
  getAllCategories(): Promise<GetAllCategoriesResponse[]>;
}
