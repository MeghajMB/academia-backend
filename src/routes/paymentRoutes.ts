// src/interfaces/routes/userRoutes.ts
import { Router } from "express";
import { UserController } from "../controllers/userController";
import { UserRepository } from "../repositories/userRepository";
import { CategoryRepository } from "../repositories/categoryRepository";
import { UserService } from "../services/userService";
import { verifyToken } from "../middleware/verify-token";
import { verifyUser } from "../middleware/verify-user";
import { TransactionRepository } from "../repositories/transactionRepository";
import { PaymentService } from "../services/paymentService";
import { PaymentController } from "../controllers/paymentController";
import { CourseRepository } from "../repositories/courseRepository";
import { CourseService } from "../services/courseService";
import { LectureRepository } from "../repositories/lectureRepository";
import { SectionRepository } from "../repositories/sectionRepository";
import { EnrollmentRepository } from "../repositories/enrollmentRepository";
import { FileService } from "../services/fileService";

const router = Router();

// Dependency injection Begin
const transactionRepository = new TransactionRepository();
const courseRepository = new CourseRepository();
const lectureRepository = new LectureRepository();
const sectionRepository = new SectionRepository();
const enrollmentRepository = new EnrollmentRepository();
const userRepository=new UserRepository()

const fileService = new FileService();

const courseService = new CourseService(
  courseRepository,
  lectureRepository,
  sectionRepository,
  enrollmentRepository,
  userRepository,
  fileService
);

const paymentService = new PaymentService(
  transactionRepository,
  courseRepository,
  courseService
);
const paymentController = new PaymentController(paymentService);
// Dependency injection End

router.post(
  "/order",
  verifyToken,
  verifyUser("instructor", "student", "admin"),
  paymentController.createOrder.bind(paymentController)
);

router.post(
  "/success",
  verifyToken,
  verifyUser("instructor", "student", "admin"),
  paymentController.paymentSuccess.bind(paymentController)
);

export default router;
