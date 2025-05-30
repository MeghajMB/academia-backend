import { GetAllCategoriesResponse } from "./category.types";

export interface ICategoryService {
  getAllCategories(): Promise<GetAllCategoriesResponse[]>;
  blockCategory(id: string): Promise<{message:string}>;
  createCategory(category: { name: string; description: string }): Promise<any>;
  editCategory(
    category: { name: string; description: string },
    categoryId: string
  ): Promise<any>;
}
