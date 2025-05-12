import { NextFunction, Request, Response } from "express";
import { CategoryService } from "../../services/category/category.service";
import { StatusCode } from "../../enums/status-code.enum";
import { ICategoryController } from "./category.interface";
import { GetAllCategoriesSchema } from "./response.dto";

export class CategoryController implements ICategoryController {
  constructor(private readonly categoryService: CategoryService) {}

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
