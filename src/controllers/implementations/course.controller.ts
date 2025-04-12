// src/interfaces/controllers/AuthController.ts
import { NextFunction, Request, Response } from "express";
//errors
import { AppError } from "../../util/errors/app-error";
import { BadRequestError } from "../../util/errors/bad-request-error";
import { StatusCode } from "../../enums/status-code.enum";

import sanitizeHtml from "sanitize-html";
import { ICourseService } from "../../services/interfaces/course-service.interface";
import {
  AddLectureRequestSchema,
  AddProcessedLectureRequestSchema,
  AddSectionRequestSchema,
  ChangeOrderOfLectureRequestSchema,
  CreateCourseRequestSchema,
  DeleteLectureRequestSchema,
  DeleteSectionRequestSchema,
  EditCourseCreationDetailsRequestSchema,
  EditLectureRequestSchema,
  EditSectionRequestSchema,
  GenerateLectureUrlRequestSchema,
  GetCourseCreationDetailsRequestSchema,
  GetCourseDetailsRequestSchema,
  GetCoursesOfInstructorRequestSchema,
  GetCoursesRequestSchema,
  GetCurriculumRequestSchema,
  ListCourseRequestSchema,
  MarkLectureAsCompletedRequestSchema,
  SubmitCourseForReviewRequestSchema,
} from "../dtos/course/request.dto";
import {
  AddLectureResponseSchema,
  AddProcessedLectureResponseSchema,
  AddSectionResponseSchema,
  ChangeOrderOfLectureResponseSchema,
  CreateCourseResponseSchema,
  DeleteLectureResponseSchema,
  DeleteSectionResponseSchema,
  EditCourseCreationDetailsResponseSchema,
  EditLectureResponseSchema,
  EditSectionResponseSchema,
  GenerateLectureUrlResponseSchema,
  GetCourseCreationDetailsResponseSchema,
  GetCourseDetailsResponseSchema,
  GetCoursesOfInstructorResponseSchema,
  GetCoursesResponseSchema,
  GetCurriculumResponseSchema,
  GetEnrolledCoursesOfUserResponseSchema,
  GetNewCoursesResponseSchema,
  ListCourseResponseSchema,
  MarkLectureAsCompletedResponseSchema,
  SubmitCourseForReviewResponseSchema,
} from "../dtos/course/response.dto";
import { ICourseController } from "../interfaces/course-controller.interface";

export class CourseController implements ICourseController {
  private pageLimit = 10;
  constructor(private courseService: ICourseService) {}

  async createCourse(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const user = req.verifiedUser!;
      const courseData = CreateCourseRequestSchema.parse(req.body);
      const sanitizedDescription = sanitizeHtml(courseData.description, {
        allowedTags: [
          "b",
          "i",
          "em",
          "strong",
          "p",
          "h1",
          "h2",
          "ul",
          "li",
          "ol",
          "a",
        ],
        allowedAttributes: {
          a: ["href", "target", "rel"],
        },
      });
      courseData.description = sanitizedDescription;
      const result = await this.courseService.createCourse(courseData, user.id);
      const response = CreateCourseResponseSchema.parse({
        status: "success",
        code: StatusCode.OK,
        message: "success",
        data: { id: result.id },
      });
      res.status(response.code).send(response);
    } catch (error) {
      next(error);
    }
  }

  async getCourses(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const payload = GetCoursesRequestSchema.parse({...req.query,limit:this.pageLimit});
      const courses = await this.courseService.getCourses(payload);
      const response = GetCoursesResponseSchema.parse({
        status: "success",
        code: StatusCode.OK,
        message: "Section added successfully",
        data: courses,
      });
      res.status(response.code).send(response);
    } catch (error) {
      next(error);
    }
  }
  async addSection(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { section, courseId } = AddSectionRequestSchema.parse(req.body);
      const userId = req.verifiedUser!.id;
      const newSection = await this.courseService.addSection(
        section,
        courseId,
        userId
      );
      const response = AddSectionResponseSchema.parse({
        status: "success",
        code: StatusCode.OK,
        message: "Section added successfully",
        data: newSection,
      });
      res.status(response.code).send(response);
    } catch (error) {
      next(error);
    }
  }

  async getEnrolledCoursesOfUser(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.verifiedUser!;
      const enrolledCourses = await this.courseService.getEnrolledCoursesOfUser(
        id
      );
      const response = GetEnrolledCoursesOfUserResponseSchema.parse({
        status: "success",
        code: StatusCode.OK,
        message: "Section added successfully",
        data: enrolledCourses,
      });
      res.status(response.code).send(response);
    } catch (error) {
      next(error);
    }
  }

  async getCurrriculum(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { courseId, status } = GetCurriculumRequestSchema.parse({
        courseId: req.params.courseId,
        status: req.query.status,
      });
      const { id, role } = req.verifiedUser!;
      if (status == "admin" && role !== "admin") {
        throw new AppError(
          "You dont have access to this course",
          StatusCode.FORBIDDEN
        );
      }
      const curriculum = await this.courseService.getCurriculum(
        courseId,
        id,
        status,
        role
      );
      const response = GetCurriculumResponseSchema.parse({
        status: "success",
        code: StatusCode.OK,
        message: "Curriculum retrieved successfully",
        data: curriculum,
      });
      res.status(response.code).send(response);
    } catch (error) {
      next(error);
    }
  }

  async getCourseDetails(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { courseId } = GetCourseDetailsRequestSchema.parse(req.params);
      const userId = req.verifiedUser?.id!;
      const courseDetails = await this.courseService.getCourseDetails(
        courseId,
        userId
      );
      const response = GetCourseDetailsResponseSchema.parse({
        status: "success",
        code: StatusCode.OK,
        message: "Course details retrieved successfully",
        data: courseDetails,
      });
      res.status(response.code).send(response);
    } catch (error) {
      next(error);
    }
  }

  async getCourseCreationDetails(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { courseId } = GetCourseCreationDetailsRequestSchema.parse(
        req.params
      );
      const userId = req.verifiedUser?.id!;
      if (!courseId) {
        throw new BadRequestError("Provide the id");
      }
      const courseDetails = await this.courseService.getCourseCreationDetails(
        courseId,
        userId
      );
      const response = GetCourseCreationDetailsResponseSchema.parse({
        status: "success",
        code: StatusCode.OK,
        message: "Course creation details retrieved successfully",
        data: courseDetails,
      });
      res.status(response.code).send(response);
    } catch (error) {
      next(error);
    }
  }

  async editCourseCreationDetails(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { courseId, ...courseDetails } =
        EditCourseCreationDetailsRequestSchema.parse({
          courseId: req.params.courseId,
          ...req.body,
        });
      const userId = req.verifiedUser?.id!;
      const updatedCourse = await this.courseService.editCourseCreationDetails(
        courseId,
        userId,
        courseDetails
      );
      const response = EditCourseCreationDetailsResponseSchema.parse({
        status: "success",
        code: StatusCode.OK,
        message: "Course creation details updated successfully",
        data: null,
      });
      res.status(response.code).send(response);
    } catch (error) {
      next(error);
    }
  }

  async getNewCourses(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const newCourses = await this.courseService.getNewCourses();
      const response = GetNewCoursesResponseSchema.parse({
        status: "success",
        code: StatusCode.OK,
        message: "Course creation details updated successfully",
        data: newCourses,
      });

      res.status(response.code).send(response);
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
      const userId = req.verifiedUser?.id!;
      const { courseId, sectionId, lectureData } =
        AddLectureRequestSchema.parse(req.body);
      const lectureResult = await this.courseService.addLecture(
        userId,
        courseId,
        sectionId,
        lectureData
      );
      const response = AddLectureResponseSchema.parse({
        status: "success",
        code: StatusCode.OK,
        message: "Lecture added successfully",
        data: lectureResult,
      });
      res.status(response.code).send(response);
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
      const { userId, courseId, sectionId, lectureId, key } =
        AddProcessedLectureRequestSchema.parse(req.body);
      const curriculum = await this.courseService.addLectureAfterProcessing(
        userId,
        courseId,
        sectionId,
        lectureId,
        key
      );
      const response = AddProcessedLectureResponseSchema.parse({
        status: "success",
        code: StatusCode.OK,
        message: "Lecture Updated Successfully",
        data: null,
      });
      res.status(response.code).send(response);
    } catch (error) {
      next(error);
    }
  }

  async generateLectureUrl(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { courseId, lectureId } = GenerateLectureUrlRequestSchema.parse(
        req.params
      );
      const { id, role } = req.verifiedUser!;

      if (!courseId || !lectureId) {
        throw new BadRequestError("Must inclue every details");
      }

      const { signedCookies, url } =
        await this.courseService.generateLectureUrl(
          courseId,
          lectureId,
          id,
          role
        );

      res.cookie("CloudFront-Policy", signedCookies["CloudFront-Policy"], {
        httpOnly: true,
        secure: true,
      });
      res.cookie(
        "CloudFront-Signature",
        signedCookies["CloudFront-Signature"],
        {
          httpOnly: true,
          secure: true,
        }
      );
      res.cookie(
        "CloudFront-Key-Pair-Id",
        signedCookies["CloudFront-Key-Pair-Id"],
        {
          httpOnly: true,
          secure: true,
        }
      );
      const response = GenerateLectureUrlResponseSchema.parse({
        status: "success",
        code: StatusCode.OK,
        message: "Lecture URL generated successfully",
        data: { url },
      });
      res.status(response.code).send(response);
    } catch (error) {
      next(error);
    }
  }

  async getCoursesOfInstructor(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { instructorId, status } =
        GetCoursesOfInstructorRequestSchema.parse({
          instructorId: req.params.instructorId,
          status: req.query.status,
        });
      const { id, role } = req.verifiedUser!;

      if (instructorId !== id && role !== "admin") {
        throw new AppError(
          "You dont have access to this route",
          StatusCode.FORBIDDEN
        );
      }
      const courses = await this.courseService.getCoursesOfInstructor(
        instructorId,
        status
      );
      const response = GetCoursesOfInstructorResponseSchema.parse({
        status: "success",
        code: StatusCode.OK,
        message: "Instructor courses retrieved successfully",
        data: courses,
      });
      res.status(response.code).send(response);
    } catch (error) {
      next(error);
    }
  }

  async deleteLecture(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.verifiedUser!.id;
      const { lectureId } = DeleteLectureRequestSchema.parse(req.params);
      const courses = await this.courseService.deleteLecture(userId, lectureId);
      const response = DeleteLectureResponseSchema.parse({
        status: "success",
        code: StatusCode.OK,
        message: "Lecture deleted successfully",
        data: null,
      });
      res.status(response.code).send(response);
    } catch (error) {
      next(error);
    }
  }

  async deleteSection(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.verifiedUser!.id;
      const { sectionId } = DeleteSectionRequestSchema.parse(req.params);
      const courses = await this.courseService.deleteSection(userId, sectionId);
      const response = DeleteSectionResponseSchema.parse({
        status: "success",
        code: StatusCode.OK,
        message: "Section deleted successfully",
        data: null,
      });
      res.status(response.code).json(response);
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
      const userId = req.verifiedUser!.id;
      const { courseId } = SubmitCourseForReviewRequestSchema.parse(req.params);

      const courses = await this.courseService.submitCourseForReview(
        userId,
        courseId
      );
      const response = SubmitCourseForReviewResponseSchema.parse({
        status: "success",
        code: StatusCode.OK,
        message: "Course submitted for review successfully",
        data: null,
      });
      res.status(response.code).json(response);
    } catch (error) {
      next(error);
    }
  }

  async markLectureAsCompleted(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.verifiedUser!;
      const { courseId, lectureId } = MarkLectureAsCompletedRequestSchema.parse(
        req.body
      );
      const result = await this.courseService.markLectureAsCompleted(
        id,
        courseId,
        lectureId
      );
      const response = MarkLectureAsCompletedResponseSchema.parse({
        status: "success",
        code: StatusCode.OK,
        message: "Lecture marked as completed",
        data: result,
      });
      res.status(response.code).json(response);
    } catch (error) {
      next(error);
    }
  }

  async listCourse(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.verifiedUser!;
      const { courseId } = ListCourseRequestSchema.parse(req.params);
      await this.courseService.listCourse(id, courseId);
      const response = ListCourseResponseSchema.parse({
        status: "success",
        code: StatusCode.OK,
        message: "Course listed successfully",
        data: null,
      });
      res.status(response.code).json(response);
    } catch (error) {
      next(error);
    }
  }

  async changeOrderOfLecture(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.verifiedUser!;
      const { draggedLectureId, targetLectureId } =
        ChangeOrderOfLectureRequestSchema.parse(req.body);

      const result = await this.courseService.changeOrderOfLecture(
        draggedLectureId,
        targetLectureId,
        id
      );
      const response = ChangeOrderOfLectureResponseSchema.parse({
        status: "success",
        code: StatusCode.OK,
        message: "Lecture order changed successfully",
        data: null,
      });
      res.status(response.code).json(response);
    } catch (error) {
      next(error);
    }
  }

  async editLecture(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.verifiedUser!;
      const { lectureId, lectureData } = EditLectureRequestSchema.parse(
        req.body
      );
      const updatedLecture = await this.courseService.editLecture(
        lectureId,
        lectureData,
        id
      );
      const response = EditLectureResponseSchema.parse({
        status: "success",
        code: StatusCode.OK,
        message: "Lecture updated successfully",
        data: updatedLecture,
      });
      res.status(response.code).json(response);
    } catch (error) {
      next(error);
    }
  }
  async editSection(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.verifiedUser!;
      const { sectionId, sectionData } = EditSectionRequestSchema.parse(
        req.body
      );
      const updatedSection = await this.courseService.editSection(
        sectionId,
        sectionData,
        id
      );
      const response = EditSectionResponseSchema.parse({
        status: "success",
        code: StatusCode.OK,
        message: "Section updated successfully",
        data: updatedSection,
      });
      res.status(response.code).json(response);
    } catch (error) {
      next(error);
    }
  }
}
