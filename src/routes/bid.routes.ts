import { Router } from "express";
import { BidController } from "../controllers/bid/bid.controller";
import { BidService } from "../services/bid/bid.service";
import { verifyToken } from "../middleware/verify-token";
import { verifyUser } from "../middleware/verify-user";
import { BidRepository } from "../repositories/bid/bid.repository";
import { UserRepository } from "../repositories/user/user.repository";
import { GigRepository } from "../repositories/gig/gig.repository";

const router = Router();

// Dependency Injection
const bidRepository = new BidRepository();
const userRepository = new UserRepository();
const gigRepository = new GigRepository();
const bidService = new BidService(bidRepository, userRepository, gigRepository);
const bidController = new BidController(bidService);

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
