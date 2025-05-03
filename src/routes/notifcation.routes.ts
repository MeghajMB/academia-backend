import { Router } from "express";
import { NotificationController } from "../controllers/notification/notification.controller";
import { NotificationService } from "../services/notification/notification.service";

import { verifyToken } from "../middleware/verify-token";
import { verifyUser } from "../middleware/verify-user";
import { NotificationRepository } from "../repositories/notification/notification.repository";

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
router.patch(
  "/mark-read",
  verifyToken,
  verifyUser("student", "instructor", "admin"),
  notificationController.markAllNotificationAsRead.bind(notificationController)
);

export default router;
