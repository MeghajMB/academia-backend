import { Document } from "mongoose";
export interface ICategory{
    name: string;
    description: string;
  }
export interface ICategoryResult extends Document {
    id?:string;
    name: string;
    description: string;
    isBlocked: boolean;
    createdAt?: Date;
    updatedAt?: Date;
  }

export interface ICategoryRepository {
  createCategory(category: ICategory): Promise<ICategoryResult|null>;
  fetchCategoryWithPagination(skip:number,limit:number):Promise<ICategoryResult[] | null>;
  findByName(name:string):Promise<ICategoryResult|null>;
  countDocuments():Promise<number>;
  findById(id:string):Promise<ICategoryResult|null>;
  getAllCategories(): Promise<ICategoryResult[] |null>;
  save(category: ICategoryResult): Promise<ICategoryResult | null>
  updateCategory(
    categoryId: string,
    updatedData: { name: string; description: string }
  ): Promise<ICategoryResult|null>;
}
