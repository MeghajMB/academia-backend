import { Router } from "express";
import { verifyToken } from "../../middleware/verify-token";
import { verifyUser } from "../../middleware/verify-user";
import { container } from "../../container";
import { IInstructorController } from "../../controllers/instructor/instructor.interface";
import { Types } from "../../container/types";

const router = Router();

const instructorController = container.get<IInstructorController>(Types.InstructorController);
// Dependency injection End

router.get(
  "/profile",
  verifyToken,
  verifyUser("instructor"),
  instructorController.getProfile.bind(instructorController)
);
router.get(
  "/analytics/summary",
  verifyToken,
  verifyUser("instructor"),
  instructorController.getAnalyticsSummary.bind(instructorController)
);
router.get(
  "/analytics",
  verifyToken,
  verifyUser("instructor"),
  instructorController.getAnalytics.bind(instructorController)
);

export default router;
