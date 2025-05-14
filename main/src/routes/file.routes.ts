import { Router } from "express";
import { verifyToken } from "../middleware/verify-token";
import { verifyUser } from "../middleware/verify-user";
import { FileController } from "../controllers/file/file.controller";
import { FileService } from "../services/file/file.service";

const router = Router();

// Dependency injection Begin
const fileService = new FileService();
const fileController = new FileController(fileService);
// Dependency injection End

//put signed url
router.post(
  "/generate-put-signed-url",
  verifyToken,
  verifyUser("instructor", "student", "admin"),
  fileController.generatePutSignedUrl.bind(fileController)
);
//get signed url
router.post(
  "/generate-get-signed-url",
  verifyToken,
  verifyUser("instructor", "student", "admin"),
  fileController.generateGetSignedUrl.bind(fileController)
);

export default router;
