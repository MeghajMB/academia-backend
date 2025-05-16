import { Router } from "express";
import { verifyToken } from "../../../middleware/verify-token";
import { verifyUser } from "../../../middleware/verify-user";
import { container } from "../../../container";
import { ILectureController } from "../../../controllers/course/lecture/lecture.interface";
import { Types } from "../../../container/types";

const router = Router();

const lectureController = container.get<ILectureController>(Types.LectureController);

/**
 * GET /api/courses/lectures/:lectureId/url
 * Generates a URL for a lecture video.
 * @param lectureId - The ID of the lecture.
 * @returns 200 with lecture URL; 400 for invalid input; 401/403 for unauthorized access; 404 if lecture not found.
 */
router.get(
  "/url/:courseId/:lectureId",
  verifyToken,
  verifyUser("instructor", "admin"),
  lectureController.generateLectureUrl.bind(lectureController)
);

/* POST routes */

/**
 * POST /api/courses/lectures
 * Creates a new lecture for a course.
 * @returns 201 with created lecture; 400 for invalid input; 401/403 for unauthorized access.
 */
router.post(
  "/",
  verifyToken,
  verifyUser("instructor"),
  lectureController.addLecture.bind(lectureController)
);

/**
 * POST /api/courses/lectures/:lectureId/complete
 * Marks a lecture as completed for a user.
 * @param lectureId - The ID of the lecture.
 * @returns 200 on success; 400 for invalid input; 401/403 for unauthorized access; 404 if lecture not found.
 */
router.post(
  "/:lectureId/complete",
  verifyToken,
  verifyUser("instructor"),
  lectureController.markLectureAsCompleted.bind(lectureController)
);

/**
 * PUT /api/courses/lectures/order
 * Changes the order of lectures in a course.
 * @returns 200 on success; 400 for invalid input; 401/403 for unauthorized access.
 */
router.put(
  "/order",
  verifyToken,
  verifyUser("instructor"),
  lectureController.changeOrderOfLecture.bind(lectureController)
);
/**
 * PUT /api/courses/lectures/:lectureId
 * Updates an existing lecture.
 * @param lectureId - The ID of the lecture.
 * @returns 200 with updated lecture; 400 for invalid input; 401/403 for unauthorized access; 404 if lecture not found.
 */
router
  .route("/:lectureId")
  .all(verifyToken, verifyUser("instructor"))
  .put(lectureController.editLecture.bind(lectureController))
  /**
   * DELETE /api/courses/lectures/:lectureId
   * Deletes a lecture from a course.
   * @param lectureId - The ID of the lecture.
   * @returns 204 on success; 400 for invalid input; 401/403 for unauthorized access; 404 if lecture not found.
   */
  .delete(lectureController.deleteLecture.bind(lectureController));

export default router;
