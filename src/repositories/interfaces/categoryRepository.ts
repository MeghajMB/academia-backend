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
  countDocuments():Promise<number> |null;
  findById(id:string):Promise<ICategoryResult|null>;
  getAllCategories(): Promise<ICategoryResult[] |null>;
  // Additional methods like getUser, updateUser, etc.
}
