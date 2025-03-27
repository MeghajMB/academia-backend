import { Router } from "express";
import { GigController } from "../controllers/implementations/gig.controller";
import { GigService } from "../services/implementations/gig.service";
import { verifyToken } from "../middleware/verify-token";
import { verifyUser } from "../middleware/verify-user";
import { GigRepository } from "../repositories/implementations/gig.repository";

const router = Router();

// Dependency Injection
const gigRepository = new GigRepository();
const gigService = new GigService(gigRepository);
const gigController = new GigController(gigService);

// Routes
router.get(
  "/active",
  verifyToken,
  gigController.getActiveGigs.bind(gigController)
);
//fetch active gig of instructor
router.get(
  "/active/:instructorId",
  verifyToken,
  verifyUser("instructor","admin"),
  gigController.getActiveGigsOfInstructor.bind(gigController)
);
router.post(
  "/create",
  verifyToken,
  verifyUser("instructor"),
  gigController.createGig.bind(gigController)
);
router.get("/id/:gigId", verifyToken, gigController.getGigById.bind(gigController));
router.put(
  "/:id",
  verifyToken,
  verifyUser("instructor"),
  gigController.updateGig.bind(gigController)
);
router.delete(
  "/:id",
  verifyToken,
  verifyUser("instructor"),
  gigController.deleteGig.bind(gigController)
);

export default router;
