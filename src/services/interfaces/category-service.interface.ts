import { ICategoryResult } from "../../repositories/interfaces/category-repository.interface";

export interface ICategoryService {
     getAllCategories(): Promise<ICategoryResult[]|null>;
}