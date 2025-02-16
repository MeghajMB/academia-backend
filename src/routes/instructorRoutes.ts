// src/interfaces/routes/userRoutes.ts
import { Router } from "express";
import { InstructorController } from "../controllers/instructorController";
import { UserRepository } from "../repositories/userRepository";
import {InstructorService} from "../services/instructorService"
import { verifyToken } from "../middleware/verify-token";
import { verifyUser } from "../middleware/verify-user";
import { CourseService } from "../services/courseService";
import { CourseRepository } from "../repositories/courseRepository";
import { CategoryRepository } from "../repositories/categoryRepository";
import { FileService } from "../services/fileService";
import { SectionRepository } from "../repositories/sectionRepository";
import { LectureRepository } from "../repositories/lectureRepository";

const router = Router();

// Dependency injection Begin
const userRepository = new UserRepository();
const courseRepository=new CourseRepository()
const categoryRepository=new CategoryRepository()
const sectionRepository= new SectionRepository();
const lectureRepository=new LectureRepository()

const fileService=new FileService()

//services
const courseService=new CourseService(courseRepository,lectureRepository,sectionRepository,fileService)
const instructorService = new InstructorService(userRepository,categoryRepository,courseService);

const instructorController = new InstructorController(instructorService);
// Dependency injection End

router.get('/profile',verifyToken,verifyUser('instructor'), instructorController.getProfile.bind(instructorController));



export default router;
