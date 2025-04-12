// src/interfaces/routes/userRoutes.ts
import { Router } from "express";
import { InstructorController } from "../controllers/implementations/instructor.controller";

import { InstructorService } from "../services/implementations/instructor.service";
import { verifyToken } from "../middleware/verify-token";
import { verifyUser } from "../middleware/verify-user";
import { CourseService } from "../services/implementations/course.service";

import { FileService } from "../services/implementations/file.service";
import { UserRepository } from "../repositories/implementations/user.repository";
import { CourseRepository } from "../repositories/implementations/course.repository";
import { CategoryRepository } from "../repositories/implementations/category.repository";
import { SectionRepository } from "../repositories/implementations/section.repository";
import { LectureRepository } from "../repositories/implementations/lecture.repository";
import { EnrollmentRepository } from "../repositories/implementations/enrollment.repository";
import { TransactionRepository } from "../repositories/implementations/transaction.repository";

const router = Router();

// Dependency injection Begin
const userRepository = new UserRepository();
const courseRepository = new CourseRepository();
const categoryRepository = new CategoryRepository();
const transactionRepository = new TransactionRepository();
const enrollmentRepository = new EnrollmentRepository();

const fileService = new FileService();

const instructorService = new InstructorService(
  userRepository,
  enrollmentRepository,
  transactionRepository,
  courseRepository
);

const instructorController = new InstructorController(instructorService);
// Dependency injection End

router.get(
  "/profile",
  verifyToken,
  verifyUser("instructor"),
  instructorController.getProfile.bind(instructorController)
);
router.get(
  "/analytics",
  verifyToken,
  verifyUser("instructor"),
  instructorController.getInstructorDashboard.bind(instructorController)
);

export default router;
