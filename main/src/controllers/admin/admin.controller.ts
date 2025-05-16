import { NextFunction, Request, Response } from "express";
import { AdminService } from "../../services/admin/admin.service";
import { StatusCode } from "../../enums/status-code.enum";
import { IAdminController } from "./admin.interface";
import {
  ApproveCourseReviewRequestSchema,
  ApproveVerificationRequestSchema,
  BlockCourseRequestSchema,
  BlockUserRequestSchema,
  getAdminCoursesRequestSchema,
  GetCategoriesRequestSchema,
  GetCourseReviewRequestsRequestSchema,
  GetInstructorVerificationRequestsRequestSchema,
  GetUsersRequestSchema,
  RejectCourseReviewRequestSchema,
  RejectVerificationRequestSchema,
} from "./request.dto";
import {
  GetAdminCoursesResponseSchema,
  GetCategoriesResponseSchema,
  GetCourseReviewRequestsResponseSchema,
  GetInstructorVerificationRequestsResponseSchema,
  GetUsersResponseSchema,
  NullResponseSchema,
} from "@academia-dev/common";
import { inject, injectable } from "inversify";
import { IAdminService } from "../../services/admin/admin.interface";
import { Types } from "../../container/types";

@injectable()
export class AdminController implements IAdminController {
  private readonly pagLimit = 10;
  constructor(
    @inject(Types.AdminService) private readonly adminService: IAdminService
  ) {}

  async getUsers(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { role, page, search } = GetUsersRequestSchema.parse(req.query);

      const result = await this.adminService.getUsers({
        role: role,
        page: page,
        limit: this.pagLimit,
        search: search,
      });
      const response = GetUsersResponseSchema.parse({
        status: "success",
        code: StatusCode.OK,
        message: "Users retrieved successfully",
        data: result,
      });
      res.status(StatusCode.OK).send(response);
    } catch (error) {
      next(error);
    }
  }

  async getAdminCourses(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { page, search } = getAdminCoursesRequestSchema.parse(req.query);
      const result = await this.adminService.getCourses({
        page,
        limit: this.pagLimit,
        search,
      });
      const response = GetAdminCoursesResponseSchema.parse({
        status: "success",
        code: StatusCode.OK,
        message: "Courses retrieved successfully",
        data: result,
      });
      res.status(StatusCode.OK).send(response);
    } catch (error) {
      next(error);
    }
  }

  async getInstructorVerificationRequests(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    const { page } = GetInstructorVerificationRequestsRequestSchema.parse(
      req.query
    );
    try {
      const result = await this.adminService.getInstructorVerificationRequests({
        page,
        limit: this.pagLimit,
      });
      const response = GetInstructorVerificationRequestsResponseSchema.parse({
        status: "success",
        code: StatusCode.OK,
        message: "Instructor verification requests retrieved successfully",
        data: result,
      });
      res.status(StatusCode.OK).send(response);
    } catch (error) {
      next(error);
    }
  }

  async rejectVerificationRequest(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { rejectReason, userId } = RejectVerificationRequestSchema.parse(
        req.body
      );

      await this.adminService.rejectVerificationRequest({
        rejectReason,
        userId,
      });
      const response = NullResponseSchema.parse({
        status: "success",
        code: StatusCode.OK,
        message: "Verification request processed",
        data: null,
      });
      res.status(StatusCode.OK).send(response);
    } catch (error) {
      next(error);
    }
  }

  async approveVerificationRequest(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { userId } = ApproveVerificationRequestSchema.parse(req.body);
      await this.adminService.approveVerificationRequest(userId);
      const response = NullResponseSchema.parse({
        status: "success",
        code: StatusCode.OK,
        message: "Verification request processed",
        data: null,
      });
      res.status(200).send(response);
    } catch (error) {
      next(error);
    }
  }

  async getCategories(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { page } = GetCategoriesRequestSchema.parse(req.query);
      const result = await this.adminService.getPaginatedCategories(
        page,
        this.pagLimit
      );
      const response = GetCategoriesResponseSchema.parse({
        status: "success",
        code: StatusCode.OK,
        message: "Categories retrieved successfully",
        data: result,
      });
      res.status(StatusCode.OK).send(response);
    } catch (error) {
      next(error);
    }
  }

  async getCourseReviewRequests(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { page } = GetCourseReviewRequestsRequestSchema.parse(req.query);

      const result = await this.adminService.getCourseReviewRequests(
        page,
        this.pagLimit
      );
      const response = GetCourseReviewRequestsResponseSchema.parse({
        status: "success",
        code: StatusCode.OK,
        message: "Course review requests retrieved successfully",
        data: result,
      });
      res.status(response.code).send(response);
    } catch (error) {
      next(error);
    }
  }

  async rejectCourseReviewRequest(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { rejectReason, courseId } = RejectCourseReviewRequestSchema.parse(
        req.body
      );
      await this.adminService.rejectCourseReviewRequest(rejectReason, courseId);
      const response = NullResponseSchema.parse({
        status: "success",
        code: StatusCode.OK,
        message: "Course review request processed",
        data: null,
      });
      res.status(response.code).send(response);
    } catch (error) {
      next(error);
    }
  }

  async approveCourseReviewRequest(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { courseId } = ApproveCourseReviewRequestSchema.parse(req.body);
      await this.adminService.approveCourseReviewRequest(courseId);
      const response = NullResponseSchema.parse({
        status: "success",
        code: StatusCode.OK,
        message: "Course review request processed",
        data: null,
      });
      res.status(response.code).send(response);
    } catch (error) {
      next(error);
    }
  }
}
