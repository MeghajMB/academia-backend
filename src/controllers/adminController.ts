// src/interfaces/controllers/AuthController.ts
import { NextFunction, Request, Response } from "express";
import { AdminService } from "../services/adminService";
//errors
import { AppError } from "../errors/app-error";
import { BadRequestError } from "../errors/bad-request-error";
import { StatusCode } from "../enums/statusCode.enum";

export class AdminController {
  private pagLimit = 10;
  constructor(private adminService: AdminService) {}

  async getUsers(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    const { role, page = 1,search="" } = req.query;
    console.log(role)
    try {
      const pageNumber = Math.max(parseInt(page as string, 10) || 1, 1);

      if (!role || typeof search !=='string') {
        throw new BadRequestError("Mention The Role");
      }
      const data = await this.adminService.getUsers(
        role.toString(),
        pageNumber,
        this.pagLimit,
        search
      );
      res.status(200).send(data);
    } catch (error) {
      next(error);
    }
  }
  async getInstructorVerificationRequests(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    const { page = 1 } = req.query;
    try {
      const pageNumber = Math.max(parseInt(page as string, 10) || 1, 1);

      const data = await this.adminService.getInstructorVerificationRequests(
        pageNumber,
        this.pagLimit
      );
      res.status(200).send(data);
    } catch (error) {
      next(error);
    }
  }
  async rejectVerificationRequest(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    const { rejectReason,userId } = req.body;

    try {
      if (!rejectReason || !userId) {
        throw new BadRequestError("Must Specify the reason");
      }
      const data = await this.adminService.rejectVerificationRequest(
        rejectReason,
        userId
      );
      res.status(200).send(data);
    } catch (error) {
      next(error);
    }
  }
  async approveVerificationRequest(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    const { userId } = req.body;

    try {
      if (!userId) {
        throw new BadRequestError("Must Specify userId");
      }
      const data = await this.adminService.approveVerificationRequest(
        userId
      );
      res.status(200).send(data);
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
      const id = req.params.userId;
      if (!id) {
        throw new BadRequestError("Mention the id");
      }
      const data = await this.adminService.blockUser(id);
      res.status(200).send({ message: "success" });
    } catch (error) {
      next(error);
    }
  }
  async getCategories(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    const { page = 1 } = req.query;
    try {
      const pageNumber = Math.max(parseInt(page as string, 10) || 1, 1);
      const data = await this.adminService.getPaginatedCategories(
        pageNumber,
        this.pagLimit
      );
      res.status(StatusCode.OK).send(data);
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
      const category = req.body;
      if (!category) {
        throw new BadRequestError("Give the category");
      }
      const data = await this.adminService.createCategory(category);
      res.status(StatusCode.OK).send(data);
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
      const {category,categoryId} = req.body;
      console.log(req.body)
      if (!category || !categoryId) {
        throw new BadRequestError("Give the category");
      }
      const data = await this.adminService.editCategory(category,categoryId);
      res.status(StatusCode.OK).send(data);
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
      const categoryId = req.params.categoryId;
      if (!categoryId) {
        throw new BadRequestError("Mention the category id");
      }
      const data = await this.adminService.blockCategory(categoryId);
      res.status(StatusCode.OK).send(data);
    } catch (error) {
      next(error);
    }
  }
  async getCourseReviewRequests(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    const { page=1 } = req.query;
    try {

      const pageNumber = Math.max(parseInt(page as string, 10) || 1, 1);

      const data = await this.adminService.getCourseReviewRequests(
        pageNumber,
        this.pagLimit
      );
      res.status(200).send(data);
    } catch (error) {
      next(error);
    }
  }
  async rejectCourseReviewRequest(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    const { rejectReason,courseId } = req.body;

    try {
      if (!rejectReason || !courseId) {
        throw new BadRequestError("Must Specify the reason");
      }
      const data = await this.adminService.rejectCourseReviewRequest(
        rejectReason,
        courseId
      );
      res.status(StatusCode.OK).send(data);
    } catch (error) {
      next(error);
    }
  }
  async approveCourseReviewRequest(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    const { courseId } = req.body;

    try {
      if (!courseId) {
        throw new BadRequestError("Must Specify userId");
      }
      const data = await this.adminService.approveCourseReviewRequest(
        courseId
      );
      res.status(StatusCode.OK).send(data);
    } catch (error) {
      next(error);
    }
  }

}
