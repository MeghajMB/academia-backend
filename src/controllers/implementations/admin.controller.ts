// src/interfaces/controllers/AuthController.ts
import { NextFunction, Request, Response } from "express";
import { AdminService } from "../../services/implementations/admin.service";
import { StatusCode } from "../../enums/status-code.enum";
import { IAdminController } from "../interfaces/admin-controller.interface";
import {
  ApproveCourseReviewRequestSchema,
  ApproveVerificationRequestSchema,
  BlockCategoryRequestSchema,
  BlockCourseRequestSchema,
  BlockUserRequestSchema,
  CreateCategoryRequestSchema,
  EditCategoryRequestSchema,
  getAdminCoursesRequestSchema,
  GetCategoriesRequestSchema,
  GetCourseReviewRequestsRequestSchema,
  GetInstructorVerificationRequestsRequestSchema,
  GetUsersRequestSchema,
  RejectCourseReviewRequestSchema,
  RejectVerificationRequestSchema,
} from "../dtos/admin/request.dto";
import {
  BlockCategoryResponseSchema,
  BlockResponseSchema,
  CategoryResponseSchema,
  CourseReviewRequestResponseSchema,
  GetAdminCoursesResponseSchema,
  GetCategoriesResponseSchema,
  GetCourseReviewRequestsResponseSchema,
  GetInstructorVerificationRequestsResponseSchema,
  GetUsersResponseSchema,
  VerificationRequestResponseSchema,
} from "../dtos/admin/response.dto";

export class AdminController implements IAdminController {
  private pagLimit = 10;
  constructor(private adminService: AdminService) {}

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

      const result = await this.adminService.rejectVerificationRequest({
        rejectReason,
        userId,
      });
      const response = VerificationRequestResponseSchema.parse({
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
      const result = await this.adminService.approveVerificationRequest(userId);
      const response = VerificationRequestResponseSchema.parse({
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

  async blockUser(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { userId } = BlockUserRequestSchema.parse(req.params);
      const data = await this.adminService.blockUser(userId);
      const response = BlockResponseSchema.parse({
        status: "success",
        code: StatusCode.OK,
        message: "success",
        data: null,
      });
      res.status(200).send(response);
    } catch (error) {
      next(error);
    }
  }

  async blockCourse(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { courseId } = BlockCourseRequestSchema.parse({
        courseId: req.params.courseId,
      });
      const data = await this.adminService.blockOrUnblockCourse(courseId);
      const response = BlockResponseSchema.parse({
        status: "success",
        code: StatusCode.OK,
        message: "success",
        data: null,
      });
      res.status(StatusCode.OK).send(response);
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
        data:result,
      });
      res.status(StatusCode.OK).send(response);
    } catch (error) {
      next(error);
    }
  }
  async createCategory(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const category = CreateCategoryRequestSchema.parse(req.body);
      const result = await this.adminService.createCategory(category);
      const response = CategoryResponseSchema.parse({
        status: "success",
        code: StatusCode.OK,
        message: "Category created successfully",
        data: result,
      });
      res.status(StatusCode.OK).send(response);
    } catch (error) {
      next(error);
    }
  }

  async editCategory(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { categoryId, category } = EditCategoryRequestSchema.parse(
        req.body
      );
      const result = await this.adminService.editCategory(category, categoryId);
      const response = CategoryResponseSchema.parse({
        status: "success",
        code: StatusCode.OK,
        message: "Category updated successfully",
        data:result,
      });
      res.status(StatusCode.OK).send(response);
    } catch (error) {
      next(error);
    }
  }
  async blockCategory(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { categoryId } = BlockCategoryRequestSchema.parse(req.params);
      const result = await this.adminService.blockCategory(categoryId);
      const response = BlockCategoryResponseSchema.parse({
        status: "success",
        code: StatusCode.OK,
        message: "Category blocked successfully",
        data: null,
      });
      res.status(response.code).send(response);
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
      const result = await this.adminService.rejectCourseReviewRequest(
        rejectReason,
        courseId
      );
      const response = CourseReviewRequestResponseSchema.parse({
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
      const result = await this.adminService.approveCourseReviewRequest(
        courseId
      );
      const response = CourseReviewRequestResponseSchema.parse({
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
