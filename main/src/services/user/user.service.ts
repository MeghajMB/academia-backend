//repository
import { IUserRepository } from "../../repositories/user/user.interface";

//services
import { IUserService } from "./user.interface";

//errors
import { NotFoundError } from "../../util/errors/not-found-error";

export class UserService implements IUserService {
  constructor(private readonly userRepository: IUserRepository) {}

  async getProfile(userId: string) {
    const userProfile = await this.userRepository.findById(userId);
    if (!userProfile) {
      throw new NotFoundError("User Not Found");
    }
    return userProfile;
  }
  async getInstructorProfile(instructorId: string) {
    try {
      const instructorProfile = await this.userRepository.findById(
        instructorId
      );
      if (!instructorProfile) {
        throw new NotFoundError("User Not Found");
      }
      const updatedInstructorProfile = {
        id: instructorProfile._id.toString(),
        name: instructorProfile.name,
        email: instructorProfile.email,
        role: instructorProfile.role,
        purpleCoin: instructorProfile.purpleCoin,
        profilePicture: instructorProfile.profilePicture,
        headline: instructorProfile.headline,
        verified: instructorProfile.verified,
        biography: instructorProfile.biography,
        links: instructorProfile.links,
        createdAt: instructorProfile.createdAt.toISOString(),
      };
      return updatedInstructorProfile;
    } catch (error) {
      throw error;
    }
  }
}
