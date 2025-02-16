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
}
