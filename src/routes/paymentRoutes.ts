// src/interfaces/routes/userRoutes.ts
import { Router } from "express";
import { UserController } from "../controllers/userController";
import { UserRepository } from "../repositories/userRepository";
import { CategoryRepository } from "../repositories/categoryRepository";
import {UserService} from "../services/userService"
import { verifyToken } from "../middleware/verify-token";
import { verifyUser } from "../middleware/verify-user";
import { TransactionRepository } from "../repositories/transactionRepository";
import { PaymentService } from "../services/paymentService";
import { PaymentController } from "../controllers/paymentController";

const router = Router();

// Dependency injection Begin
const transactionRepository = new TransactionRepository();

const paymentService = new PaymentService(transactionRepository);
const paymentController = new PaymentController(paymentService);
// Dependency injection End

router.post('/order',verifyToken,verifyUser('instructor','student','admin'), paymentController.createOrder.bind(paymentController));

export default router;
