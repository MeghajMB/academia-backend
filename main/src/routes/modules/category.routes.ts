import { Router } from "express";
import { verifyToken } from "../../middleware/verify-token";
import { verifyUser } from "../../middleware/verify-user";
import { container } from "../../container";
import { ICategoryController } from "../../controllers/category/category.interface";
import { Types } from "../../container/types";

const router = Router();

const categoryController = container.get<ICategoryController>(
  Types.CategoryController
);

// Routes
router.get(
  "/all",
  verifyToken,
  verifyUser("instructor", "student"),
  categoryController.getAllCategories.bind(categoryController)
);

//create category
router.post(
  "/",
  verifyToken,
  verifyUser("admin"),
  categoryController.createCategory.bind(categoryController)
);
//block category
router.put(
  "/block/:categoryId",
  verifyToken,
  verifyUser("admin"),
  categoryController.blockCategory.bind(categoryController)
);
//edit category
router.put(
  "/:categoryId",
  verifyToken,
  verifyUser("admin"),
  categoryController.editCategory.bind(categoryController)
);

export default router;
