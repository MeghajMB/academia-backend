import { NextFunction, Request, Response } from "express";
import { CategoryService } from "../../services/category/category.service";
import { StatusCode } from "../../enums/status-code.enum";
import { ICategoryController } from "../interfaces/category-controller.interface";
import { GetAllCategoriesSchema } from "../dtos/category/response.dto";

export class CategoryController implements ICategoryController {
  private categoryService: CategoryService;

  constructor(categoryService: CategoryService) {
    this.categoryService = categoryService;
  }

  async getAllCategories(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await this.categoryService.getAllCategories();
      const response = GetAllCategoriesSchema.parse({
        status: "success",
        code: StatusCode.OK,
        message: "Categories retrieved successfully",
        data: result,
      });
      res.status(StatusCode.OK).json(response);
    } catch (error) {
      next(error);
    }
  }
}
