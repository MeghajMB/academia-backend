import { Router } from "express";
import { verifyToken } from "../../middleware/verify-token";
import { verifyUser } from "../../middleware/verify-user";
import { container } from "../../container";
import { INotificationController } from "../../controllers/notification/notification.interface";
import { Types } from "../../container/types";

const router = Router();

const notificationController = container.get<INotificationController>(Types.NotificationController);

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
