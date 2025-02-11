// src/interfaces/routes/userRoutes.ts
import { Router } from "express";
import { verifyToken } from "../middleware/verify-token";
import { verifyUser } from "../middleware/verify-user";
import { CourseRepository } from "../repositories/courseRepository";
import { CourseController } from "../controllers/courseController";
import { CourseService } from "../services/courseService";
import { CurriculumRepository } from "../repositories/curriculumRepository";
import { FileService } from "../services/fileService";

const router = Router();

// Dependency injection Begin
const courseRepository = new CourseRepository();
const curriculumRepository=new CurriculumRepository()

const fileService=new FileService()

const courseService = new CourseService(courseRepository,curriculumRepository,fileService);
const courseController = new CourseController(courseService);
// Dependency injection End

router.get('/curriculum/:courseId',verifyToken,verifyUser('instructor','student','admin'), courseController.getCurrriculum.bind(courseController));
//add lecture
router.post('/add-lecture',verifyToken,verifyUser('instructor'), courseController.addLecture.bind(courseController));

router.get('/lecture/:id',verifyToken,verifyUser('instructor','student','admin'), courseController.getLecture.bind(courseController));

//add the processed lecture to database
router.post('/processed-lecture', courseController.addProcessedLecture.bind(courseController));
//preview the course
router.get('/preview/get-lecture-url/:courseId/:sectionId/:lectureId',verifyToken,verifyUser('instructor','admin'), courseController.generateLecturePreviewLectureUrl.bind(courseController));
//fetch the courses for instructor
router.get('/:instructorId',verifyToken,verifyUser('instructor','admin'), courseController.getCourseOfInstructor.bind(courseController));
//submit coure for review of admin
router.get('/:courseId/submit-review',verifyToken,verifyUser('instructor'), courseController.submitCourseForReview.bind(courseController));

export default router;
