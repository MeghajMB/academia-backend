import { Router } from "express";
import { verifyToken } from "../../middleware/verify-token";
import { verifyUser } from "../../middleware/verify-user";
import { container } from "../../container";
import { IFileController } from "../../controllers/file/file.interface";
import { Types } from "../../container/types";

const router = Router();

const fileController = container.get<IFileController>(Types.FileController);
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
