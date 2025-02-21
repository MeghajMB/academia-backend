import { Router } from "express";
import { ReviewController } from "../controllers/reviewController";
import { ReviewService } from "../services/reviewService";
import { ReviewRepository } from "../repositories/reviewRepository";
import { verifyToken } from "../middleware/verify-token";
import { verifyUser } from "../middleware/verify-user";
import { EnrollmentRepository } from "../repositories/enrollmentRepository";

const router = Router();

// Dependency Injection
const reviewRepository = new ReviewRepository();
const enrollmentRepository = new EnrollmentRepository();
const reviewService = new ReviewService(reviewRepository, enrollmentRepository);
const reviewController = new ReviewController(reviewService);

// Routes
router.post(
  "/add-review",
  verifyToken,
  verifyUser("student", "instructor", "admin"),
  reviewController.addReview.bind(reviewController)
);

router.get(
  "/get/:courseId",
  reviewController.getReviewsByCourse.bind(reviewController)
);

router.get(
  "/student/:studentId",
  reviewController.getReviewsByStudent.bind(reviewController)
);

router.delete(
  "/:reviewId",
  verifyToken,
  verifyUser("student", "instructor", "admin"),
  reviewController.deleteReview.bind(reviewController)
);

export default router;
