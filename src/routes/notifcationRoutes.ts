import { Router } from "express";
import { NotificationController } from "../controllers/notificationController";
import { NotificationService } from "../services/notificationService";
import { NotificationRepository } from "../repositories/notificationRepository";
import { verifyToken } from "../middleware/verify-token";
import { verifyUser } from "../middleware/verify-user";

const router = Router();

// Dependency Injection
const notificationRepository = new NotificationRepository();
const notificationService = new NotificationService(notificationRepository);
const notificationController = new NotificationController(notificationService);

router.post(
  "/",
  verifyToken,
  verifyUser("student", "instructor", "admin"),
  notificationController.sendNotification.bind(notificationController)
);
router.get(
  "/unread/:userId",
  verifyToken,
  verifyUser("student", "instructor", "admin"),
  notificationController.getUserNotifications.bind(notificationController)
);
router.patch(
  "/mark-read/:notificationId",
  verifyToken,
  verifyUser("student", "instructor", "admin"),
  notificationController.markNotificationAsRead.bind(notificationController)
);

export default router;
