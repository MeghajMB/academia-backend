import { Router } from "express";
import { CategoryController } from "../controllers/implementations/category.controller";
import { CategoryService } from "../services/implementations/category.service";
import { verifyToken } from "../middleware/verify-token";
import { verifyUser } from "../middleware/verify-user";
import { CategoryRepository } from "../repositories/implementations/category.repository";

const router = Router();

// Dependency Injection
const categoryRepository = new CategoryRepository();
const categoryService = new CategoryService(categoryRepository);
const categoryController = new CategoryController(categoryService);

// Routes
router.get(
  "/all",
  verifyToken,
  verifyUser("instructor", "student"),
  categoryController.getAllCategories.bind(categoryController)
);

export default router;
