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
    const { role, page = 1 } = req.query;
    try {
      const pageNumber = Math.max(parseInt(page as string, 10) || 1, 1);

      if (!role) {
        throw new BadRequestError("Mention The Role");
      }
      const data = await this.adminService.getUsers(
        role.toString(),
        pageNumber,
        this.pagLimit
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

      const data = await this.adminService.getInstructorVerificationRequests(pageNumber,this.pagLimit);
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
      const data = await this.adminService.createCategory(category);
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
      const data = await this.adminService.blockCategory(categoryId);
      res.status(StatusCode.OK).send(data);
    } catch (error) {
      next(error);
    }
  }
}
