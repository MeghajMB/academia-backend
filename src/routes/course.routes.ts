// src/interfaces/routes/userRoutes.ts
import { Router } from "express";
import { verifyToken } from "../middleware/verify-token";
import { verifyUser } from "../middleware/verify-user";
import { CourseController } from "../controllers/implementations/course.controller";
import { CourseService } from "../services/course/course.service";
import { FileService } from "../services/file/file.service";
import { CourseRepository } from "../repositories/course/course.repository";
import { LectureRepository } from "../repositories/lecture/lecture.repository";
import { SectionRepository } from "../repositories/section/section.repository";
import { EnrollmentRepository } from "../repositories/enrollment/enrollment.repository";
import { UserRepository } from "../repositories/user/user.repository";
import { ReviewRepository } from "../repositories/review/review.repository";

const router = Router();

// Dependency injection Begin
const courseRepository = new CourseRepository();
const lectureRepository = new LectureRepository();
const sectionRepository = new SectionRepository();
const enrollmentRepository = new EnrollmentRepository();
const userRepository = new UserRepository();
const reviewRepository=new ReviewRepository()

const fileService = new FileService();

const courseService = new CourseService(
  courseRepository,
  lectureRepository,
  sectionRepository,
  enrollmentRepository,
  userRepository,
  fileService,
  reviewRepository
);
const courseController = new CourseController(courseService);
// Dependency injection End

/* GET routes */

//fetch Courses
router.get(
  "/all",
  verifyToken,
  verifyUser("instructor", "student", "admin"),
  courseController.getCourses.bind(courseController)
);
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
//fetch the Course Creation Details
router.get(
  "/create-course/:courseId",
  verifyToken,
  verifyUser("instructor"),
  courseController.getCourseCreationDetails.bind(courseController)
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
//fetch the enrolled course list of user
router.get(
  "/enrolled-courses",
  verifyToken,
  verifyUser("student","instructor"),
  courseController.getEnrolledCoursesOfUser.bind(courseController)
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
// Mark Lecture as Completed
router.post(
  "/progress",
  verifyToken,
  verifyUser("instructor"),
  courseController.markLectureAsCompleted.bind(courseController)
);

/* PUT Routes */

//Change order of lectures
router.put(
  "/lectures/update-order",
  verifyToken,
  verifyUser("instructor"),
  courseController.changeOrderOfLecture.bind(courseController)
);
//edit the lecture
router.put(
  "/edit-lecture",
  verifyToken,
  verifyUser("instructor"),
  courseController.editLecture.bind(courseController)
);
//edit the Section
router.put(
  "/edit-section",
  verifyToken,
  verifyUser("instructor"),
  courseController.editSection.bind(courseController)
);
//Edit Course
router.put(
  "/edit-course/:courseId",
  verifyToken,
  verifyUser("instructor"),
  courseController.editCourseCreationDetails.bind(courseController)
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

/* DELETE Routes */

//delete course lecture
router.delete(
  "/delete-lecture/:lectureId",
  verifyToken,
  verifyUser("instructor"),
  courseController.deleteLecture.bind(courseController)
);
//delete course section
router.delete(
  "/delete-section/:sectionId",
  verifyToken,
  verifyUser("instructor"),
  courseController.deleteSection.bind(courseController)
);

export default router;
