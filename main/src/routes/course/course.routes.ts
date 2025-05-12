import { Router } from "express";
import { verifyToken } from "../../middleware/verify-token";
import { verifyUser } from "../../middleware/verify-user";
import { CourseController } from "../../controllers/course/course.controller";
import { CourseService } from "../../services/course/course.service";
import { FileService } from "../../services/file/file.service";
import { CourseRepository } from "../../repositories/course/course.repository";
import { LectureRepository } from "../../repositories/course/lecture/lecture.repository";
import { SectionRepository } from "../../repositories/course/section/section.repository";
import { EnrollmentRepository } from "../../repositories/enrollment/enrollment.repository";
import { ReviewRepository } from "../../repositories/review/review.repository";

const router = Router();

/**
 * Dependency Injection
 * Initializes repositories, services, and controller for course operations.
 */
const courseRepository = new CourseRepository();
const lectureRepository = new LectureRepository();
const sectionRepository = new SectionRepository();
const enrollmentRepository = new EnrollmentRepository();
const reviewRepository = new ReviewRepository();

const fileService = new FileService();

const courseService = new CourseService(
  courseRepository,
  lectureRepository,
  sectionRepository,
  enrollmentRepository,
  fileService,
  reviewRepository
);
const courseController = new CourseController(courseService);

/**
 * GET /api/courses/:courseId/analytics
 * Fetches analytics for a specific course.
 * Restricted to authenticated instructors who own the course.
 * @param courseId - The ID of the course.
 * @returns 200 with course analytics; 400 for invalid input; 401/403 for unauthorized access; 404 if course not found.
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
 * @returns 200 with course curriculum; 400 for invalid input; 401/403 for unauthorized access; 404 if course not found.
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
 * @returns 200 with course details; 400 for invalid input; 401/403 for unauthorized access; 404 if course not found.
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
 * @returns 200 with course creation details; 400 for invalid input; 401/403 for unauthorized access; 404 if course not found.
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
 * @returns 200 with list of new courses; 401/403 for unauthorized access.
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
 * @returns 200 with list of instructor's courses; 400 for invalid input; 401/403 for unauthorized access.
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
 * @returns 200 with list of enrolled courses; 401/403 for unauthorized access.
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
 * @returns 200 with list of courses; 401/403 for unauthorized access.
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
 * @returns 201 with created course; 400 for invalid input; 401/403 for unauthorized access.
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
 * @returns 200 with updated course; 400 for invalid input; 401/403 for unauthorized access; 404 if course not found.
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
 * @returns 200 on success; 400 for invalid input; 401/403 for unauthorized access; 404 if course not found.
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
 * @returns 200 on success; 400 for invalid input; 401/403 for unauthorized access; 404 if course not found.
 */
router.patch(
  "/:courseId/publish",
  verifyToken,
  verifyUser("instructor"),
  courseController.listCourse.bind(courseController)
);

export default router;
