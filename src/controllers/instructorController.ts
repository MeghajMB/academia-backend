// src/interfaces/controllers/AuthController.ts
import { NextFunction, Request, Response } from "express";
import { InstructorService } from "../services/instructorService";
//errors
import { AppError } from "../errors/app-error";
import { BadRequestError } from "../errors/bad-request-error";
import { StatusCode } from "../enums/statusCode.enum";
//external dependencies
import sanitizeHtml from 'sanitize-html'

export class InstructorController {
  constructor(private instructorService: InstructorService) {}

  async getProfile(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const user = req.verifiedUser;
      const data = await this.instructorService.getProfile(user?.id!);
      res.status(StatusCode.OK).send(data);
    } catch (error) {
      next(error);
    }
  }
  async createCourse(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const user = req.verifiedUser;
      const courseData=req.body;
          const sanitizedDescription = sanitizeHtml(courseData.description, {
            allowedTags: ['b', 'i', 'em', 'strong', 'p', 'h1', 'h2', 'ul', 'li', 'ol', 'a'],
            allowedAttributes: {
              a: ['href', 'target', 'rel'],
            },
          });
      
      const data = await this.instructorService.createCourse({...courseData,description:sanitizedDescription},user!);
      res.status(StatusCode.OK).send(data);
    } catch (error) {
      next(error);
    }
  }
  async createSection(req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void>{
    try {
      const user = req.verifiedUser!;
      const {section ,courseId}=req.body
      if(!section || !courseId){
        throw new BadRequestError("Bad Request")
      }
      const newSection=await this.instructorService.createSection(section as {title:string,description:string},courseId,user?.id);
      res.status(StatusCode.OK).send(newSection);
      
    } catch (error) {
      next(error);
    }
  }

  async createLecture(){

  }

}
