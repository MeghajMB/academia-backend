import { Router } from "express";
import { verifyToken } from "../../middleware/verify-token";
import { verifyUser } from "../../middleware/verify-user";
import { container } from "../../container";
import { IBidController } from "../../controllers/bid/bid.interface";
import { Types } from "../../container/types";

const router = Router();

const bidController = container.get<IBidController>(Types.BidController);

// Routes
router.post(
  "/create",
  verifyToken,
  verifyUser("student", "instructor", "admin"),
  bidController.placeBid.bind(bidController)
);
router.get("/:id", verifyToken, bidController.getBidById.bind(bidController));
router.get(
  "/gig/:gigId",
  verifyToken,
  bidController.getBidsForGig.bind(bidController)
);

export default router;
