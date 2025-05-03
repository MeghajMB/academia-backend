import { NextFunction, Request, Response } from "express";
import { AppError } from "../../util/errors/app-error";
import { BadRequestError } from "../../util/errors/bad-request-error";
import { StatusCode } from "../../enums/status-code.enum";
import sanitizeHtml from "sanitize-html";
import { ICourseService } from "../../services/course/course.interface";
import {
  CreateCourseRequestSchema,
  EditCourseCreationDetailsRequestSchema,
  GetCourseAnalyticsRequestSchema,
  GetCourseCreationDetailsRequestSchema,
  GetCourseDetailsRequestSchema,
  GetCoursesOfInstructorRequestSchema,
  GetCoursesRequestSchema,
  GetCurriculumRequestSchema,
  ListCourseRequestSchema,
  SubmitCourseForReviewRequestSchema,
} from "./request.dto";
import {
  CreateCourseResponseSchema,
  EditCourseCreationDetailsResponseSchema,
  GetCourseAnalyticsResponseSchema,
  GetCourseCreationDetailsResponseSchema,
  GetCourseDetailsResponseSchema,
  GetCoursesOfInstructorResponseSchema,
  GetCoursesResponseSchema,
  GetCurriculumResponseSchema,
  GetEnrolledCoursesOfUserResponseSchema,
  GetNewCoursesResponseSchema,
  ListCourseResponseSchema,
} from "./response.dto";
import { ICourseController } from "./course.interface";
import { NullResponseSchema } from "../shared-response.dto";

export class CourseController implements ICourseController {
  private pageLimit = 10;
  constructor(private readonly courseService: ICourseService) {}

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
      const payload = GetCoursesRequestSchema.parse({
        ...req.query,
        limit: this.pageLimit,
      });
      const courses = await this.courseService.getCourses(payload);
      const response = GetCoursesResponseSchema.parse({
        status: "success",
        code: StatusCode.OK,
        message: "Courses Retrieved Successfully",
        data: courses,
      });
      res.status(response.code).send(response);
    } catch (error) {
      next(error);
    }
  }
  async getCourseAnalytics(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { filter, courseId } = GetCourseAnalyticsRequestSchema.parse({
        ...req.query,
        ...req.params,
      });
      const userId = req.verifiedUser?.id;
      const result = await this.courseService.getCourseAnalytics(
        filter,
        courseId,
        userId!
      );
      const response = GetCourseAnalyticsResponseSchema.parse({
        status: "success",
        code: StatusCode.OK,
        message: "Course Analytics Retrieved Successfully",
        data: result,
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
        message: "Courses fetched successfully",
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
      const response = NullResponseSchema.parse({
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
}
