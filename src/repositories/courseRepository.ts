
import { CategoryModel } from "../models/categoyModel";
import { CourseModel } from "../models/courseModel";
import { ICourse, ICourseRepository, ICourseResult } from "./interfaces/courseRepository";

export class CourseRepository implements ICourseRepository {
  async createCourse(course: ICourse,session:object): Promise<ICourseResult | null> {
    const createdCourse = new CourseModel(course,session);
    await createdCourse.save()
    return createdCourse;
  }
 
}
