// src/interfaces/routes/userRoutes.ts
import { Router } from "express";
import { UserController } from "../controllers/implementations/user.controller";

import { UserService } from "../services/user/user.service";
import { verifyToken } from "../middleware/verify-token";
import { verifyUser } from "../middleware/verify-user";
import { UserRepository } from "../repositories/user/user.repository";

const router = Router();

// Dependency injection Begin
const userRepository = new UserRepository();

const userService = new UserService(userRepository);
const userController = new UserController(userService);
// Dependency injection End

router.get(
  "/profile/:userId",
  verifyToken,
  verifyUser("instructor", "student", "admin"),
  userController.getProfile.bind(userController)
);
router.get(
  "/instructor-profile/:instructorId",
  verifyToken,
  verifyUser("instructor", "student", "admin"),
  userController.getInstructorProfile.bind(userController)
);

export default router;
