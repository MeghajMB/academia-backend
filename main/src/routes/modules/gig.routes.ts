import { Router } from "express";
import { verifyToken } from "../../middleware/verify-token";
import { verifyUser } from "../../middleware/verify-user";
import { container } from "../../container";
import { ISessionController } from "../../controllers/session/session.interface";
import { Types } from "../../container/types";
import { IGigController } from "../../controllers/gig/gig.interface";

const router = Router();

const sessionController =  container.get<ISessionController>(Types.SessionController);
const gigController =  container.get<IGigController>(Types.GigController);

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
