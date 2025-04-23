import { Router } from "express";
import { ReviewController } from "../controllers/implementations/review.controller";
import { ReviewService } from "../services/review/review.service";

import { verifyToken } from "../middleware/verify-token";
import { verifyUser } from "../middleware/verify-user";
import { ReviewRepository } from "../repositories/review/review.repository";
import { EnrollmentRepository } from "../repositories/enrollment/enrollment.repository";
import { CourseRepository } from "../repositories/course/course.repository";

const router = Router();

// Dependency Injection
const reviewRepository = new ReviewRepository();
const enrollmentRepository = new EnrollmentRepository();
const courseRepository = new CourseRepository();
const reviewService = new ReviewService(
  reviewRepository,
  enrollmentRepository,
  courseRepository
);
const reviewController = new ReviewController(reviewService);

// Routes

/* GET Routes */

//get reviews of a course
router.get(
  "/get/:courseId",
  reviewController.getReviewsOfCourse.bind(reviewController)
);

//get reviews of a student
router.get(
  "/student/:studentId",
  reviewController.getReviewsByStudent.bind(reviewController)
);

/* POST Routes */

//add a review
router.post(
  "/add-review",
  verifyToken,
  verifyUser("student", "instructor", "admin"),
  reviewController.addReview.bind(reviewController)
);
/* PUT Routes */

//edit a review
router.put(
  "/edit-review",
  verifyToken,
  verifyUser("student", "instructor", "admin"),
  reviewController.editReview.bind(reviewController)
);

/* DELETE Routes */

//delete review
router.delete(
  "/delete/:reviewId",
  verifyToken,
  verifyUser("student", "instructor", "admin"),
  reviewController.deleteReview.bind(reviewController)
);

export default router;
