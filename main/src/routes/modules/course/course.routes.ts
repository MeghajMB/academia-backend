import { Router } from "express";
import { verifyToken } from "../../../middleware/verify-token";
import { verifyUser } from "../../../middleware/verify-user";
import { container } from "../../../container";
import { ICourseController } from "../../../controllers/course/course.interface";
import { Types } from "../../../container/types";

const router = Router();

const courseController = container.get<ICourseController>(Types.CourseController);

/**
 * GET /api/courses/:courseId/analytics
 * Fetches analytics for a specific course.
 * Restricted to authenticated instructors who own the course.
 * @param courseId - The ID of the course.
 */
router.get(
  "/analytics/:courseId",
  verifyToken,
  verifyUser("instructor"),
  courseController.getCourseAnalytics.bind(courseController)
);

/**
 * GET /api/courses/:courseId/curriculum
 * Fetches the curriculum (lectures and sections) of a specific course.
 * Accessible to authenticated instructors, students, and admins.
 * @param courseId - The ID of the course.
 */
router.get(
  "/:courseId/curriculum",
  verifyToken,
  verifyUser("instructor", "student", "admin"),
  courseController.getCurrriculum.bind(courseController)
);
/**
 * GET /api/courses/:courseId
 * Fetches detailed information about a specific course.
 * Accessible to authenticated instructors, students, and admins.
 * @param courseId - The ID of the course.
 */
router.get(
  "/course-details/:courseId",
  verifyToken,
  verifyUser("instructor", "student", "admin"),
  courseController.getCourseDetails.bind(courseController)
);
/**
 * GET /api/courses/:courseId/creation
 * Fetches creation details for a specific course.
 * Restricted to authenticated instructors who own the course.
 * @param courseId - The ID of the course.
 */
router.get(
  "/create-course/:courseId",
  verifyToken,
  verifyUser("instructor"),
  courseController.getCourseCreationDetails.bind(courseController)
);
/**
 * GET /api/courses/new
 * Fetches newly created courses.
 */
router.get(
  "/new",
  verifyToken,
  verifyUser("instructor", "student", "admin"),
  courseController.getNewCourses.bind(courseController)
);

/**
 * GET /api/courses/instructor/:instructorId
 * Fetches courses created by a specific instructor.
 * Accessible to authenticated instructors (for their own courses) and admins.
 * @param instructorId - The ID of the instructor.
 */
router.get(
  "/instructor/:instructorId",
  verifyToken,
  verifyUser("instructor", "admin"),
  courseController.getCoursesOfInstructor.bind(courseController)
);
/**
 * GET /api/courses/enrolled
 * Fetches the list of courses a user is enrolled in.
 */
router.get(
  "/enrolled-courses",
  verifyToken,
  verifyUser("student", "instructor"),
  courseController.getEnrolledCoursesOfUser.bind(courseController)
);

/**
 * GET /api/courses
 * Fetches a list of courses.
 */
router
.route("/")
.get(
  verifyToken,
  verifyUser("instructor", "student", "admin"),
  courseController.getCourses.bind(courseController)
)
/**
 * POST /api/courses
 * Creates a new course.
 * Restricted to authenticated instructors.
 */
.post(
  verifyToken,
  verifyUser("instructor"),
  courseController.createCourse.bind(courseController)
);

/**
 * PUT /api/courses/:courseId
 * Updates an existing course.
 * Restricted to authenticated instructors who own the course.
 * @param courseId - The ID of the course.
 */
router.put(
  "/edit-course/:courseId",
  verifyToken,
  verifyUser("instructor"),
  courseController.editCourseCreationDetails.bind(courseController)
);

/**
 * PATCH /api/courses/:courseId/submit
 * Submits a course for admin review.
 * Restricted to authenticated instructors who own the course.
 * @param courseId - The ID of the course.
 */
router.patch(
  "/:courseId/submit-review",
  verifyToken,
  verifyUser("instructor"),
  courseController.submitCourseForReview.bind(courseController)
);

/**
 * PATCH /api/courses/:courseId/publish
 * Publishes (lists) a course.
 * Restricted to authenticated instructors who own the course.
 * Publishes a CoursePublished event to Kafka.
 * @param courseId - The ID of the course.
 */
router.patch(
  "/:courseId/publish",
  verifyToken,
  verifyUser("instructor"),
  courseController.listCourse.bind(courseController)
);

/**
 * PUT /api/courses/block/:courseId
 * Blocks a coirse
 * Restricted to admin
 * @param courseId - The ID of the course.
 */
router.put(
  "/block/:courseId",
  verifyToken,
  verifyUser("admin"),
  courseController.blockCourse.bind(courseController)
);

export default router;
