import { UserProfileResponse } from "./user.types";

export interface IUserService {
  getProfile(userId: string): Promise<UserProfileResponse>;
  blockUser(id: string): Promise<{ message: string }>;
}
