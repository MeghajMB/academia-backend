import { Router } from "express";
import { CategoryController } from "../controllers/categoryController";
import { CategoryRepository } from "../repositories/categoryRepository";
import { CategoryService } from "../services/categoryService";
import { verifyToken } from "../middleware/verify-token";
import { verifyUser } from "../middleware/verify-user";

const router = Router();

// Dependency Injection
const categoryRepository = new CategoryRepository();
const categoryService = new CategoryService(categoryRepository);
const categoryController = new CategoryController(categoryService);

// Routes
router.get('/all', verifyToken,verifyUser('instructor','student'), categoryController.getAllCategories.bind(categoryController));

export default router;
