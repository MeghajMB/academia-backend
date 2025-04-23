//repository
import { IUserRepository } from "../../repositories/user/user.interface";

//services
import { IUserService } from "./user.interface";

//errors
import { NotFoundError } from "../../util/errors/not-found-error";

export class UserService implements IUserService {
  constructor(private userRepository: IUserRepository) {}

  async getProfile(userId: string) {
    const userProfile = await this.userRepository.findById(userId);
    if (!userProfile) {
      throw new NotFoundError("User Not Found");
    }
    return userProfile;
  }
  async getInstructorProfile(instructorId: string) {
    try {
      const instructorProfile = await this.userRepository.findById(instructorId);
      if (!instructorProfile) {
        throw new NotFoundError("User Not Found");
      }
      return instructorProfile;
    } catch (error) {
      throw error;
    }
  }
}
