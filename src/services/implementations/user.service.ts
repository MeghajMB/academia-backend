//repository
import { IUserRepository } from "../../repositories/interfaces/user-repository.interface";

//services
import { IUserService } from "../interfaces/user-service.interface";

//errors
import { NotFoundError } from "../../util/errors/not-found-error";


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