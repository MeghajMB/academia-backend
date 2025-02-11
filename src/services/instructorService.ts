// src/services/AuthService.ts
import { UserRepository } from "../repositories/userRepository";
import { CategoryRepository } from "../repositories/categoryRepository";
//services
import { CourseService } from "./courseService";

//errors
import { NotFoundError } from "../errors/not-found-error";
import { BadRequestError } from "../errors/bad-request-error";

//externl dependencies
import sanitizeHtml from 'sanitize-html'
import { StatusCode } from "../enums/statusCode.enum";

export class InstructorService {
  constructor(
    private userRepository: UserRepository,
    private categoryRepository: CategoryRepository,
    private courseService: CourseService
  ) {}

  async getProfile(userId:string) {
    const userProfile = await this.userRepository.findById(userId);
    if (!userProfile) {
      throw new NotFoundError("User Not Found");
    }
    return userProfile;
  }

  async createCourse(
    courseData: {
      title: string;
      subtitle: string;
      category: string;
      price: string;
      description: string;
      image: {
        key: string,
        size: number,
        type: string,
        name: string
      };
      video: {
        key: string,
        size: number,
        type: string,
        name: string
      };
    },
    user: { role: string; email: string; id: string }
  ) {
  

    let courseDetails={
      userId:user.id,
      title: courseData.title,
      price: parseFloat(courseData.price),
      subtitle: courseData.subtitle,
      description: courseData.description,
      category: courseData.category,
      imageThumbnail:courseData.image.key,
      promotionalVideo:courseData.video.key,
    }

    const category=await this.categoryRepository.findById(courseData.category);
    if(!category){
      throw new BadRequestError("Specify the category")
    }
    
    const newCourse = await this.courseService.createCourse(
      courseDetails,
      user.id
    );
    return newCourse;
  }
  async createSection(section:{title:string,description:string},courseId:string,userId:string) {
  
      const curriculum=(await this.courseService.createSection(courseId,section)).toObject();
      const newSection=curriculum.sections.pop();
    
      //change the _id to  id
      if (newSection) {
        const { _id, ...rest } = newSection;
        const updatedSection = {
          ...rest,
          id: _id,
        };
        return updatedSection;
      }
  }
}
