import { NextFunction, Request, Response } from "express";
import { CategoryService } from "../services/categoryService";
import { StatusCode } from "../enums/statusCode.enum";

export class CategoryController {
  private categoryService: CategoryService;

  constructor(categoryService: CategoryService) {
    this.categoryService = categoryService;
  }

  async getAllCategories(req: Request, res: Response,next:NextFunction) {
    try {
      const categories = await this.categoryService.getAllCategories();
      res.status(StatusCode.OK).json(categories);
    } catch (error) {
      next(error);
    }
  }
}
