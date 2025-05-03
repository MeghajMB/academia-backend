import { Router } from "express";
import { ReviewController } from "../controllers/review/review.controller";
import { ReviewService } from "../services/review/review.service";

import { verifyToken } from "../middleware/verify-token";
import { verifyUser } from "../middleware/verify-user";
import { ReviewRepository } from "../repositories/review/review.repository";
import { EnrollmentRepository } from "../repositories/enrollment/enrollment.repository";
import { CourseRepository } from "../repositories/course/course.repository";

const router = Router();

/**
 * Dependency Injection
 * Initializes repositories and services for the Reviews bounded context.
 */

const reviewRepository = new ReviewRepository();
const enrollmentRepository = new EnrollmentRepository();
const courseRepository = new CourseRepository();
const reviewService = new ReviewService(
  reviewRepository,
  enrollmentRepository,
  courseRepository
);
const reviewController = new ReviewController(reviewService);

/**
 * Routes for managing reviews in the Reviews bounded context.
 */

/**
 * GET /reviews/course/:courseId
 * Fetches all reviews for a specific course.
 */
router.get(
  "/course/:courseId",
  reviewController.getReviewsOfCourse.bind(reviewController)
);

/**
 * GET /reviews/student/:studentId
 * Fetches all reviews submitted by a specific student.
 */
router.get(
  "/student/:studentId",
  reviewController.getReviewsByStudent.bind(reviewController)
);

/**
 * POST /add-review
 * Creates a new review for a course.
 */
router.post(
  "/add-review",
  verifyToken,
  verifyUser("student", "instructor", "admin"),
  reviewController.addReview.bind(reviewController)
);

/**
 * PUT /reviews/:reviewId
 * Updates an existing review by its ID.
 */
router
  .route("/:reviewId")
  .all(verifyToken, verifyUser("student", "instructor", "admin"))
  .put(reviewController.editReview.bind(reviewController))
  /**
   * DELETE /reviews/:reviewId
   * Deletes a review by its ID.
   */
  .delete(reviewController.deleteReview.bind(reviewController));

export default router;
