import { Router } from "express";
import { verifyToken } from "../../middleware/verify-token";
import { verifyUser } from "../../middleware/verify-user";
import { container } from "../../container";
import { IPaymentController } from "../../controllers/payment/payment.interface";
import { Types } from "../../container/types";

const router = Router();

const paymentController = container.get<IPaymentController>(Types.PaymentController);

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

router.get(
  "/wallet",
  verifyToken,
  verifyUser("instructor", "student"),
  paymentController.getUserWallet.bind(paymentController)
);

router.get(
  "/transaction",
  verifyToken,
  verifyUser("instructor", "student"),
  paymentController.getTransactionHistory.bind(paymentController)
);

export default router;
