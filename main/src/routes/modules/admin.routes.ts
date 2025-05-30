import { Router } from "express";
import { verifyToken } from "../../middleware/verify-token";
import { verifyUser } from "../../middleware/verify-user";

import { IAdminController } from "../../controllers/admin/admin.interface";
import { Types } from "../../container/types";
import { container } from "../../container";

const router = Router();

const adminController = container.get<IAdminController>(Types.AdminController);

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
//fetch admin dashboard
router.get(
  "/analytics",
  verifyToken,
  verifyUser("admin"),
  adminController.getAnalytics.bind(adminController)
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

/* PUT Routes */

// approve instructor profile
router.put(
  "/instructor-request/approve",
  verifyToken,
  verifyUser("admin"),
  adminController.approveVerificationRequest.bind(adminController)
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
