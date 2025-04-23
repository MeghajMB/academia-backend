import { Router } from "express";
import { InstructorController } from "../controllers/implementations/instructor.controller";

import { InstructorService } from "../services/instructor/instructor.service";
import { verifyToken } from "../middleware/verify-token";
import { verifyUser } from "../middleware/verify-user";

import { UserRepository } from "../repositories/user/user.repository";
import { CourseRepository } from "../repositories/course/course.repository";
import { GigRepository } from "../repositories/gig/gig.repository";
import { TransactionRepository } from "../repositories/transaction/transaction.repository";
import { EnrollmentRepository } from "../repositories/enrollment/enrollment.repository";

const router = Router();

// Dependency injection Begin
const userRepository = new UserRepository();
const courseRepository = new CourseRepository();
const gigRepository = new GigRepository();
const transactionRepository=new TransactionRepository()
const enrollmentRepository=new EnrollmentRepository()

const instructorService = new InstructorService(
  userRepository,
  gigRepository,
  courseRepository,
  transactionRepository,
  enrollmentRepository
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
  "/analytics/summary",
  verifyToken,
  verifyUser("instructor"),
  instructorController.getAnalyticsSummary.bind(instructorController)
);
router.get(
  "/analytics",
  verifyToken,
  verifyUser("instructor"),
  instructorController.getAnalytics.bind(instructorController)
);

export default router;
