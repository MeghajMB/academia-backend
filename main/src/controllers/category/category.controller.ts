import { NextFunction, Request, Response } from "express";
import { CategoryService } from "../../services/category/category.service";
import { StatusCode } from "../../enums/status-code.enum";
import { ICategoryController } from "./category.interface";
import {
  CategoryResponseSchema,
  GetAllCategoriesSchema,
  NullResponseSchema,
} from "@academia-dev/common";
import {
  BlockCategoryRequestSchema,
  CreateCategoryRequestSchema,
  EditCategoryRequestSchema,
} from "./request.dto";
import { inject, injectable } from "inversify";
import { Types } from "../../container/types";

@injectable()
export class CategoryController implements ICategoryController {
  constructor(
    @inject(Types.CategoryService)
    private readonly categoryService: CategoryService
  ) {}

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

  async createCategory(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const category = CreateCategoryRequestSchema.parse(req.body);
      const result = await this.categoryService.createCategory(category);
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
      const { categoryId, category } = EditCategoryRequestSchema.parse({
        ...req.body,
        ...req.params,
      });
      const result = await this.categoryService.editCategory(
        category,
        categoryId
      );
      const response = CategoryResponseSchema.parse({
        status: "success",
        code: StatusCode.OK,
        message: "Category updated successfully",
        data: result,
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
      await this.categoryService.blockCategory(categoryId);
      const response = NullResponseSchema.parse({
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
}
