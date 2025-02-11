import { ICourseResult } from "../../types/courseInterface";
export interface ICourse{
  userId:string;
  title: string;
  price: number;
  subtitle: string;
  description: string;
  category: string;
  imageThumbnail:string;
  promotionalVideo:string;
  }


export interface ICourseRepository {
  createCourse(course: ICourse,session:object): Promise<ICourseResult>;
  // Additional methods like getUser, updateUser, etc.
}
