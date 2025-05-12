import { IUserResult } from "../../repositories/user/user.types";


export interface IUserService {
  getProfile(userId: string): Promise<IUserResult>;
}
