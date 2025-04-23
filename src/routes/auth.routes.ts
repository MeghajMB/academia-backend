// src/interfaces/routes/userRoutes.ts
import { Router } from "express";
import { AuthController } from "../controllers/implementations/auth.controller";

import { AuthService } from "../services/auth/auth.service";
import { verifyToken } from "../middleware/verify-token";

import {
  authenticateGoogle,
  googleController,
  googleCallback,
} from "../services/google/google.service";
import { verifyUser } from "../middleware/verify-user";
import { UserRepository } from "../repositories/user/user.repository";

const router = Router();

// Dependency injection
const userRepository = new UserRepository();
const authService = new AuthService(userRepository);
const authController = new AuthController(authService);

//Refresh Token-Route to get new access token
router.post("/refresh", authController.refreshToken.bind(authController));

// Otp Routes For SignIn
router.post("/signup", authController.signUp.bind(authController));
router.post("/verify-otp", authController.verifyOtp.bind(authController));
router.post("/resend-otp", authController.resendOtp.bind(authController));
//forgot password
router.post(
  "/forgot-password",
  authController.forgotPassword.bind(authController)
);
router.post(
  "/verify-reset-password",
  authController.verifyResetOtp.bind(authController)
);
router.post(
  "/reset-password",
  authController.resetPassword.bind(authController)
);

//Login
router.post("/signin", authController.signIn.bind(authController));

//Logout
router.post("/signout", authController.signOut.bind(authController));

//Instructor Creation
router.post(
  "/register-instructor",
  verifyToken,
  verifyUser("student"),
  authController.registerInstructor.bind(authController)
);

//Google SignIn Route
router.get("/google", authenticateGoogle);
router.get("/google/callback", googleCallback, googleController);

export default router;
