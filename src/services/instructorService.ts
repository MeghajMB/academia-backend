// src/services/AuthService.ts
import { UserRepository } from "../repositories/userRepository";
//services
import { CourseService } from "./courseService";


//errors
import { RequestValidationError } from "../errors/request-validaion-error";
import { ExistingUserError } from "../errors/existing-user-error";
import { AppError } from "../errors/app-error";

//externl dependencies
import { StatusCode } from "../enums/statusCode.enum";
import { NotFoundError } from "../errors/not-found-error";

export class InstructorService {
  constructor(private userRepository: UserRepository,private courseService: CourseService) {}

  async getProfile(user:{role:string,email:string,id:string}){
    const userProfile=await this.userRepository.findById(user.id);
    if(!userProfile){
        throw new NotFoundError('User Not Found')
    }
    return userProfile;
  }

  async createCourse(courseData: any, user: { role: string; email: string; id: string }) {
    console.log(courseData);
    throw new Error('Dummy');
    const newCourse = await this.courseService.createCourse(courseData, user.id);
    return newCourse;
    
  }
  
}