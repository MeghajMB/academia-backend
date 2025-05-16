import { Router } from "express";
import { verifyToken } from "../../middleware/verify-token";
import { verifyUser } from "../../middleware/verify-user";
import { container } from "../../container";
import { IPaymentController } from "../../controllers/payment/payment.interface";
import { Types } from "../../container/types";

const router = Router();

const paymentController = container.get<IPaymentController>(Types.PaymentController);
// Dependency injection End

router.post(
  "/order",
  verifyToken,
  verifyUser("instructor", "student", "admin"),
  paymentController.createOrder.bind(paymentController)
);

router.post(
  "/success",
  verifyToken,
  verifyUser("instructor", "student", "admin"),
  paymentController.paymentSuccess.bind(paymentController)
);

export default router;
