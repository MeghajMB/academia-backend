import { Router } from "express";
import { verifyToken } from "../../middleware/verify-token";
import { verifyUser } from "../../middleware/verify-user";
import { container } from "../../container";
import { IUserController } from "../../controllers/user/user.interface";
import { Types } from "../../container/types";

const router = Router();

const userController = container.get<IUserController>(Types.UserController);

router.get(
  "/profile/:userId",
  verifyToken,
  verifyUser("instructor", "student", "admin"),
  userController.getProfile.bind(userController)
);
/**
 * PUT /user/profile
 * Updates the profile of the user
 */
router.put(
  "/profile",
  verifyToken,
  verifyUser("instructor", "student"),
  userController.putProfile.bind(userController)
);

router.get(
  "/instructor-profile/:instructorId",
  verifyToken,
  verifyUser("instructor", "student", "admin"),
  userController.getInstructorProfile.bind(userController)
);

// block/unblock user
router.put(
  "/block/:userId",
  verifyToken,
  verifyUser("admin"),
  userController.blockUser.bind(userController)
);

export default router;
