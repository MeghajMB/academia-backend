import { Router } from "express";
import { AdminController } from "../controllers/admin/admin.controller";

import { AdminService } from "../services/admin/admin.service";
import { verifyToken } from "../middleware/verify-token";
import { verifyUser } from "../middleware/verify-user";

import { NotificationService } from "../services/notification/notification.service";
import { UserRepository } from "../repositories/user/user.repository";
import { CategoryRepository } from "../repositories/category/category.repository";
import { CourseRepository } from "../repositories/course/course.repository";
import { NotificationRepository } from "../repositories/notification/notification.repository";

const router = Router();

// Dependency injection Begin
//repositories
const userRepository = new UserRepository();
const categoryRepository = new CategoryRepository();
const courseRepository = new CourseRepository();
const notificationRepository = new NotificationRepository();
//services
const notificationService = new NotificationService(notificationRepository);
const adminService = new AdminService(
  userRepository,
  categoryRepository,
  courseRepository,
  notificationService
);
//controller
const adminController = new AdminController(adminService);
// Dependency injection End

/* GET Routes */

// fetch instructors or students
router.get(
  "/get-users",
  verifyToken,
  verifyUser("admin"),
  adminController.getUsers.bind(adminController)
);
// fetch requests for instructors
router.get(
  "/instructor-requests",
  verifyToken,
  verifyUser("admin"),
  adminController.getInstructorVerificationRequests.bind(adminController)
);
// fetch paginated categories
router.get(
  "/get-categories",
  verifyToken,
  verifyUser("admin"),
  adminController.getCategories.bind(adminController)
);
//fetch review course requests
router.get(
  "/course-review-requests",
  verifyToken,
  verifyUser("admin"),
  adminController.getCourseReviewRequests.bind(adminController)
);
//fetch paginated courses
router.get(
  "/get-courses",
  verifyToken,
  verifyUser("admin"),
  adminController.getAdminCourses.bind(adminController)
);

/* POST Routes */

// approve instructor profile
router.post(
  "/instructor-request/approve",
  verifyToken,
  verifyUser("admin"),
  adminController.getInstructorVerificationRequests.bind(adminController)
);
// reject instructor profile
router.post(
  "/instructor-request/reject",
  verifyToken,
  verifyUser("admin"),
  adminController.rejectVerificationRequest.bind(adminController)
);
//create category
router.post(
  "/create-category",
  verifyToken,
  verifyUser("admin"),
  adminController.createCategory.bind(adminController)
);
//edit category
router.post(
  "/edit-category",
  verifyToken,
  verifyUser("admin"),
  adminController.editCategory.bind(adminController)
);

/* PUT Routes */

// block/unblock user
router.put(
  "/block-user/:userId",
  verifyToken,
  verifyUser("admin"),
  adminController.blockUser.bind(adminController)
);
// block/unblock course
router.put(
  "/block-course/:courseId",
  verifyToken,
  verifyUser("admin"),
  adminController.blockCourse.bind(adminController)
);
// approve instructor profile
router.put(
  "/instructor-request/approve",
  verifyToken,
  verifyUser("admin"),
  adminController.approveVerificationRequest.bind(adminController)
);
//block category
router.put(
  "/block-category/:categoryId",
  verifyToken,
  verifyUser("admin"),
  adminController.blockCategory.bind(adminController)
);
// reject instructor profile
router.put(
  "/course-review-requests/reject",
  verifyToken,
  verifyUser("admin"),
  adminController.rejectCourseReviewRequest.bind(adminController)
);
// approve instructor profile
router.put(
  "/course-review-requests/approve",
  verifyToken,
  verifyUser("admin"),
  adminController.approveCourseReviewRequest.bind(adminController)
);

export default router;
