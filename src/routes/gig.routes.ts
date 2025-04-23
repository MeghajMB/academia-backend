import { Router } from "express";
import { GigController } from "../controllers/implementations/gig.controller";
import { GigService } from "../services/gig/gig.service";
import { verifyToken } from "../middleware/verify-token";
import { verifyUser } from "../middleware/verify-user";
import { GigRepository } from "../repositories/gig/gig.repository";

const router = Router();

// Dependency Injection
const gigRepository = new GigRepository();
const gigService = new GigService(gigRepository);
const gigController = new GigController(gigService);

//fetch all active gigs
router.get(
  "/active",
  verifyToken,
  gigController.getActiveGigs.bind(gigController)
);
//fetch all gigs
router.get(
  "/all",
  verifyToken,
  gigController.getGigsOfInstructor.bind(gigController)
);
//fetch active gig of instructor
router.get(
  "/active/:instructorId",
  verifyToken,
  verifyUser("instructor","admin"),
  gigController.getActiveGigsOfInstructor.bind(gigController)
);
//create a gig
router.post(
  "/create",
  verifyToken,
  verifyUser("instructor"),
  gigController.createGig.bind(gigController)
);
//get gig with id
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