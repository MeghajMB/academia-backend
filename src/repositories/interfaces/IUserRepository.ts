import { Document } from "mongoose";
import { IUser, IUserResult } from "../../types/user.interface";

// Interface for the user document

export interface IUserRepository {
  createUser(user: IUser): Promise<IUserResult>;
  findById(id: string): Promise<IUserResult | null>;
  findByEmail(email: string): Promise<IUserResult | null>;
  fetchUsersWithPagination(skip:number,limit:number,role:string,search:string):Promise<IUserResult[] | null>;
  fetchUsersWithFilters(filters: { [key: string]: any },skip: number,limit: number,):Promise<IUserResult[] | null> 
  countDocuments(key:string,value: any): Promise<number>;
  save(user: IUserResult): Promise<IUserResult>;
  // Additional methods like getUser, updateUser, etc.
}
