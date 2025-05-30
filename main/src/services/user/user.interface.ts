import { PutUserProfileRequestSchemaRequestDTO } from "../../controllers/user/request.dto";
import { UserProfileResponse } from "./user.types";

export interface IUserService {
  getProfile(userId: string): Promise<UserProfileResponse>;
  blockUser(id: string): Promise<{ message: string }>;
  updateProfile(
    updateprofileParams: PutUserProfileRequestSchemaRequestDTO
  ): Promise<{ message: string }>;
  getInstructorProfile(instructorId: string): Promise<unknown>;
}
