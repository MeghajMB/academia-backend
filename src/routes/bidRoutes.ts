import { Router } from "express";
import { BidController } from "../controllers/bidController";
import { BidRepository } from "../repositories/bidRepository";
import { BidService } from "../services/bidService";
import { verifyToken } from "../middleware/verify-token";
import { verifyUser } from "../middleware/verify-user";
import { UserRepository } from "../repositories/userRepository";
//import { KafkaService } from "../services/kafkaService";

const router = Router();

// Dependency Injection
const bidRepository = new BidRepository();
const userRepository = new UserRepository();
const bidService = new BidService(bidRepository, userRepository);
//const kafkaService = new KafkaService(bidService);
const bidController = new BidController(bidService);

// Routes
router.post(
  "/create",
  verifyToken,
  verifyUser("student","instructor","admin"),
  bidController.placeBid.bind(bidController)
);
router.get("/:id", verifyToken, bidController.getBidById.bind(bidController));
router.get(
  "/gig/:gigId",
  verifyToken,
  bidController.getBidsForGig.bind(bidController)
);
router.put(
  "/:id",
  verifyToken,
  verifyUser("student"),
  bidController.updateBid.bind(bidController)
);
router.delete(
  "/:id",
  verifyToken,
  verifyUser("student"),
  bidController.deleteBid.bind(bidController)
);

export default router;
