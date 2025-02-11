// src/interfaces/routes/userRoutes.ts
import { Router } from "express";
import { verifyToken } from "../middleware/verify-token";
import { verifyUser } from "../middleware/verify-user";
import { CourseRepository } from "../repositories/courseRepository";
import { CourseController } from "../controllers/courseController";
import { CourseService } from "../services/courseService";
import { CurriculumRepository } from "../repositories/curriculumRepository";

const router = Router();

// Dependency injection Begin
const courseRepository = new CourseRepository();
const curriculumRepository=new CurriculumRepository()

const courseService = new CourseService(courseRepository,curriculumRepository);
const courseController = new CourseController(courseService);
// Dependency injection End

router.get('/curriculum/:courseId',verifyToken,verifyUser('instructor','student','admin'), courseController.getCurrriculum.bind(courseController));

export default router;
