//services
import { CourseService } from "./course.service";

//errors
import { NotFoundError } from "../../util/errors/not-found-error";
import { BadRequestError } from "../../util/errors/bad-request-error";

//externl dependencies
import sanitizeHtml from 'sanitize-html'
import { StatusCode } from "../../enums/status-code.enum";
import { CategoryRepository } from "../../repositories/implementations/category.repository";
import { UserRepository } from "../../repositories/implementations/user.repository";

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
