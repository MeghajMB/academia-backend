// src/interfaces/routes/userRoutes.ts
import { Router } from "express";
import { InstructorController } from "../controllers/instructorController";
import { UserRepository } from "../repositories/userRepository";
import {InstructorService} from "../services/instructorService"
import { verifyToken } from "../middleware/verify-token";
import { verifyUser } from "../middleware/verify-user";
import { CourseService } from "../services/courseService";
import { CourseRepository } from "../repositories/courseRepository";
import { CurriculumRepository } from "../repositories/curriculumRepository";

const router = Router();

// Dependency injection Begin
const userRepository = new UserRepository();
const courseRepository=new CourseRepository()
const curriculumRepository=new CurriculumRepository()

//services
const courseService=new CourseService(courseRepository,curriculumRepository)
const instructorService = new InstructorService(userRepository,courseService);

const instructorController = new InstructorController(instructorService);
// Dependency injection End

router.get('/profile',verifyToken,verifyUser('instructor'), instructorController.getProfile.bind(instructorController));

//create course 
router.post('/create-course',verifyToken,verifyUser('instructor'), instructorController.createCourse.bind(instructorController));

export default router;
