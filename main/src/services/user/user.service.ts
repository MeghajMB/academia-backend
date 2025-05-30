//repository
import { IUserRepository } from "../../repositories/user/user.interface";

//services
import { IUserService } from "./user.interface";
import { redis } from "../../lib/redis";
//errors
import { NotFoundError } from "../../util/errors/not-found-error";
import { UserProfileResponse } from "./user.types";
import { inject, injectable } from "inversify";
import { Types } from "../../container/types";
import { PutUserProfileRequestSchemaRequestDTO } from "../../controllers/user/request.dto";

@injectable()
export class UserService implements IUserService {
  constructor(
    @inject(Types.userRepository)
    private readonly userRepository: IUserRepository
  ) {}

  async updateProfile(
    updateprofileParams: PutUserProfileRequestSchemaRequestDTO
  ):Promise<{ message: string }> {
    await this.userRepository.update(
      updateprofileParams.userId,
      {
        name: updateprofileParams.name,
        headline: updateprofileParams.headLine,
        profilePicture: updateprofileParams.imageUrl,
      },
      {}
    );
    return { message: "success" };
  }

  async getProfile(userId: string): Promise<UserProfileResponse> {
    const userProfile = await this.userRepository.findById(userId);
    if (!userProfile) {
      throw new NotFoundError("User Not Found");
    }
    const updatedUserProfile = {
      id: userProfile.id,
      name: userProfile.name,
      email: userProfile.email,
      role: userProfile.role,
      phoneNo: userProfile.phoneNo,
      isBlocked: userProfile.isBlocked,
      purpleCoin: userProfile.purpleCoin,
      profilePicture: userProfile.profilePicture,
      headline: userProfile.headline,
      verified: userProfile.verified,
      biography: userProfile.biography,
      links: userProfile.links,
      createdAt: userProfile.createdAt.toISOString(),
    };
    return updatedUserProfile;
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

  async blockUser(userId: string) {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError();
    }
    await this.userRepository.update(
      userId,
      { isBlocked: !user.isBlocked },
      {}
    );
    if (user.isBlocked) {
      await redis.del(`refreshToken:${user.id}`);
    }
    return { message: user.isBlocked ? "User blocked" : "User unblocked" };
  }
}
