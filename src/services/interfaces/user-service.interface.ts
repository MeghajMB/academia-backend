import { IUserResult } from "../../types/user.interface";

export interface IUserService {
  getProfile(userId: string): Promise<IUserResult>;
}
