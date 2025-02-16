//repository
import { IUserRepository } from "../repositories/interfaces/IUserRepository";

//services
import { IUserService } from "./interfaces/IUserService";

//errors
import { NotFoundError } from "../errors/not-found-error";


export class UserService implements IUserService {
  constructor(private userRepository: IUserRepository) {}

  async getProfile(userId:string){
    const userProfile=await this.userRepository.findById(userId);
    if(!userProfile){
        throw new NotFoundError('User Not Found')
    }
    return userProfile;
  }
  
}