import { Router } from "express";
import { GigController } from "../controllers/gig/gig.controller";
import { GigService } from "../services/gig/gig.service";
import { verifyToken } from "../middleware/verify-token";
import { verifyUser } from "../middleware/verify-user";
import { GigRepository } from "../repositories/gig/gig.repository";
import { SessionRepository } from "../repositories/session/session.repository";
import { SessionService } from "../services/session/session.service";
import { SessionController } from "../controllers/session/session.controller";

const router = Router();

// Dependency Injection
const gigRepository = new GigRepository();
const gigService = new GigService(gigRepository);
const gigController = new GigController(gigService);
//session controller
const sessionRepository = new SessionRepository();
const sessionService = new SessionService(sessionRepository);
const sessionController = new SessionController(sessionService);

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
  verifyUser("instructor", "admin"),
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
router.get(
  "/id/:gigId",
  verifyToken,
  gigController.getGigById.bind(gigController)
);

/* Session */
router.get(
  "/session/all",
  verifyToken,
  verifyUser("instructor", "student"),
  sessionController.getSessionsOfUser.bind(sessionController)
);

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
