// src/services/AuthService.ts
import { UserRepository } from "../repositories/userRepository";
import { CategoryRepository } from "../repositories/categoryRepository";
//services

import { transporter } from "../util/emailClient";
import { redis } from "../config/redisClient";

//errors
import { RequestValidationError } from "../errors/request-validaion-error";
import { ExistingUserError } from "../errors/existing-user-error";
import { AppError } from "../errors/app-error";

//externl dependencies
import validator from "validator";
import { StatusCode } from "../enums/statusCode.enum";
import { NotFoundError } from "../errors/not-found-error";

export class UserService {
  constructor(private userRepository: UserRepository,private categoryRepository:CategoryRepository) {}

  async getProfile(user:{role:string,email:string,id:string}){
    const userProfile=await this.userRepository.findById(user.id);
    if(!userProfile){
        throw new NotFoundError('User Not Found')
    }
    return {user:userProfile};
  }
  
}