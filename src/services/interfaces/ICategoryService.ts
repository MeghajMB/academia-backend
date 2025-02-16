import { ICategoryResult } from "../../repositories/interfaces/ICategoryRepository";

export interface ICategoryService {
     getAllCategories(): Promise<ICategoryResult[]|null>;
}