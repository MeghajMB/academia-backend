// src/interfaces/routes/userRoutes.ts
import { Router } from "express";
import { verifyToken } from "../middleware/verify-token";
import { verifyUser } from "../middleware/verify-user";
import { CourseRepository } from "../repositories/courseRepository";
import { CourseController } from "../controllers/courseController";
import { CourseService } from "../services/courseService";
import { FileService } from "../services/fileService";
import { LectureRepository } from "../repositories/lectureRepository";
import { SectionRepository } from "../repositories/sectionRepository";
import { EnrollmentRepository } from "../repositories/enrollmentRepository";

const router = Router();

// Dependency injection Begin
const courseRepository = new CourseRepository();
const lectureRepository = new LectureRepository();
const sectionRepository = new SectionRepository();
const enrollmentRepository = new EnrollmentRepository();

const fileService = new FileService();

const courseService = new CourseService(
  courseRepository,
  lectureRepository,
  sectionRepository,
  enrollmentRepository,
  fileService
);
const courseController = new CourseController(courseService);
// Dependency injection End

/* GET routes */

//fetch the curriculum (lectures and sections)
router.get(
  "/curriculum/:courseId",
  verifyToken,
  verifyUser("instructor", "student", "admin"),
  courseController.getCurrriculum.bind(courseController)
);
//fetch the Course details
router.get(
  "/course-details/:courseId",
  verifyToken,
  verifyUser("instructor", "student", "admin"),
  courseController.getCourseDetails.bind(courseController)
);
//fetch the new courses
router.get(
  "/new",
  verifyToken,
  verifyUser("instructor", "student", "admin"),
  courseController.getNewCourses.bind(courseController)
);

//get the lecture url
router.get(
  "/get-lecture-url/:courseId/:lectureId",
  verifyToken,
  verifyUser("instructor", "admin"),
  courseController.generateLectureUrl.bind(courseController)
);
//fetch the courses of instructor
router.get(
  "/get/:instructorId",
  verifyToken,
  verifyUser("instructor", "admin"),
  courseController.getCoursesOfInstructor.bind(courseController)
);

/* POST routes */

//create course
router.post(
  "/create-course",
  verifyToken,
  verifyUser("instructor"),
  courseController.createCourse.bind(courseController)
);
//add section
router.post(
  "/create-section",
  verifyToken,
  verifyUser("instructor"),
  courseController.addSection.bind(courseController)
);
//add lecture
router.post(
  "/add-lecture",
  verifyToken,
  verifyUser("instructor"),
  courseController.addLecture.bind(courseController)
);
//add the processed lecture to database
router.post(
  "/processed-lecture",
  courseController.addProcessedLecture.bind(courseController)
);

/* PUT Routes */

router.put(
  "/lectures/update-order",
  verifyToken,
  verifyUser("instructor"),
  courseController.changeOrderOfLecture.bind(courseController)
);
router.put(
  "/edit-lecture",
  verifyToken,
  verifyUser("instructor"),
  courseController.editLecture.bind(courseController)
);

/* PATCH Routes */

//submit coure for review of admin
router.patch(
  "/:courseId/submit-review",
  verifyToken,
  verifyUser("instructor"),
  courseController.submitCourseForReview.bind(courseController)
);
//list the course
router.patch(
  "/:courseId/list",
  verifyToken,
  verifyUser("instructor"),
  courseController.listCourse.bind(courseController)
);

export default router;
