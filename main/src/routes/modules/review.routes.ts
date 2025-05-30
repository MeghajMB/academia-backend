import { Router } from "express";
import { verifyToken } from "../../middleware/verify-token";
import { verifyUser } from "../../middleware/verify-user";
import { container } from "../../container";
import { IReviewController } from "../../controllers/review/review.interface";
import { Types } from "../../container/types";

const router = Router();

const reviewController = container.get<IReviewController>(Types.ReviewController);

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
