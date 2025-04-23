// src/interfaces/routes/userRoutes.ts
import { Router } from "express";
import { verifyToken } from "../middleware/verify-token";
import { verifyUser } from "../middleware/verify-user";

import { PaymentService } from "../services/payment/payment.service";
import { PaymentController } from "../controllers/implementations/payment.controller";
import { CourseService } from "../services/course/course.service";

import { FileService } from "../services/file/file.service";
import { TransactionRepository } from "../repositories/transaction/transaction.repository";
import { CourseRepository } from "../repositories/course/course.repository";
import { LectureRepository } from "../repositories/lecture/lecture.repository";
import { SectionRepository } from "../repositories/section/section.repository";
import { EnrollmentRepository } from "../repositories/enrollment/enrollment.repository";
import { UserRepository } from "../repositories/user/user.repository";
import { PaymentRepository } from "../repositories/payment/payment.repository";
import { ReviewRepository } from "../repositories/review/review.repository";

const router = Router();

// Dependency injection Begin
const transactionRepository = new TransactionRepository();
const courseRepository = new CourseRepository();
const lectureRepository = new LectureRepository();
const sectionRepository = new SectionRepository();
const enrollmentRepository = new EnrollmentRepository();
const userRepository = new UserRepository();
const paymentRepository=new PaymentRepository()
const reviewRepository=new ReviewRepository()

const fileService = new FileService();

const courseService = new CourseService(
  courseRepository,
  lectureRepository,
  sectionRepository,
  enrollmentRepository,
  userRepository,
  fileService,
  reviewRepository
);

const paymentService = new PaymentService(
  transactionRepository,
  courseRepository,
  courseService,
  enrollmentRepository,
  paymentRepository
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
