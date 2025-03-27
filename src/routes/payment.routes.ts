// src/interfaces/routes/userRoutes.ts
import { Router } from "express";
import { UserController } from "../controllers/implementations/user.controller";

import { UserService } from "../services/implementations/user.service";
import { verifyToken } from "../middleware/verify-token";
import { verifyUser } from "../middleware/verify-user";

import { PaymentService } from "../services/implementations/payment.service";
import { PaymentController } from "../controllers/implementations/payment.controller";
import { CourseService } from "../services/implementations/course.service";

import { FileService } from "../services/implementations/file.service";
import { TransactionRepository } from "../repositories/implementations/transaction.repository";
import { CourseRepository } from "../repositories/implementations/course.repository";
import { LectureRepository } from "../repositories/implementations/lecture.repository";
import { SectionRepository } from "../repositories/implementations/section.repository";
import { EnrollmentRepository } from "../repositories/implementations/enrollment.repository";
import { UserRepository } from "../repositories/implementations/user.repository";

const router = Router();

// Dependency injection Begin
const transactionRepository = new TransactionRepository();
const courseRepository = new CourseRepository();
const lectureRepository = new LectureRepository();
const sectionRepository = new SectionRepository();
const enrollmentRepository = new EnrollmentRepository();
const userRepository = new UserRepository();

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
