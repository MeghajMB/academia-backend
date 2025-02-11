// src/interfaces/controllers/AuthController.ts
import { NextFunction, Request, Response } from "express";
//errors
import { AppError } from "../errors/app-error";
import { BadRequestError } from "../errors/bad-request-error";
import { StatusCode } from "../enums/statusCode.enum";
import { CourseService } from "../services/courseService";

export class CourseController {
  constructor(private courseService: CourseService) {}

  async getCurrriculum(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { courseId } = req.params;
      if (!courseId) {
        throw new BadRequestError("Provide the id");
      }
      const curriculum = await this.courseService.getCurriculum(courseId);
      res.status(StatusCode.OK).send(curriculum);
    } catch (error) {
      next(error);
    }
  }

  async addLecture(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { courseId,sectionId,lectureData } = req.body;
      if (!courseId || !sectionId || !lectureData) {
        throw new BadRequestError("Give valid data");
      }
      const curriculum = await this.courseService.addLecture(courseId,sectionId,lectureData);
      res.status(StatusCode.OK).send(curriculum);
    } catch (error) {
      next(error);
    }
  }

  async getLecture(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { courseId,sectionId,lectureData } = req.body;
      if (!courseId || !sectionId || !lectureData) {
        throw new BadRequestError("Give valid data");
      }
      const curriculum = await this.courseService.addLecture(courseId,sectionId,lectureData);
      res.status(StatusCode.OK).send(curriculum);
    } catch (error) {
      next(error);
    }
  }

  async addProcessedLecture(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { userId,courseId,sectionId,lectureId,key } = req.body;
      //do something here
      if(!userId||!courseId||!sectionId||!lectureId||!key){
        throw new BadRequestError("Must inclue every details");
      }
      const curriculum = await this.courseService.addLectureAfterProcessing(userId,courseId,sectionId,lectureId,key);
      res.status(StatusCode.OK).send({message:"Lecture Updated Successfully"})
    } catch (error) {
      next(error);
    }
  }
  async generateLecturePreviewLectureUrl(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { courseId,sectionId,lectureId } = req.params;
      const {id,role}=req.verifiedUser!
      
      if(!courseId||!sectionId||!lectureId){
        throw new BadRequestError("Must inclue every details");
      }
      const {signedCookies,url} = await this.courseService.generateLecturePreviewLectureUrl(courseId,sectionId,lectureId,id,role);
      
      res.cookie("CloudFront-Policy", signedCookies["CloudFront-Policy"], {
        httpOnly: true,
        secure: true,
      });
      res.cookie("CloudFront-Signature", signedCookies["CloudFront-Signature"], {
        httpOnly: true,
        secure: true,
      });
      res.cookie("CloudFront-Key-Pair-Id", signedCookies["CloudFront-Key-Pair-Id"], {
        httpOnly: true,
        secure: true,
      });
      res.status(StatusCode.OK).send({url})
    } catch (error) {
      next(error);
    }
  }
  async getCourseOfInstructor(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const {instructorId}=req.params
      const {status}=req.query
      //do something here
      if(!instructorId||!status||typeof status!=='string'){
        throw new BadRequestError("Must inclue every details");
      }
      const courses = await this.courseService.getCourseOfInstructor(instructorId,status);
      res.status(StatusCode.OK).send(courses)
    } catch (error) {
      next(error);
    }
  }
  async submitCourseForReview(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const {id}=req.verifiedUser!
      const {courseId}=req.params

      if(!courseId||!id){
        throw new BadRequestError("Must inclue every details");
      }
      const courses = await this.courseService.submitCourseForReview(id,courseId);
      res.status(StatusCode.OK).send(courses)
    } catch (error) {
      next(error);
    }
  }

}
