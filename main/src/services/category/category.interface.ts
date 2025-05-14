import { GetAllCategoriesResponse } from "./category.types";

export interface ICategoryService {
  getAllCategories(): Promise<GetAllCategoriesResponse[]>;
}
