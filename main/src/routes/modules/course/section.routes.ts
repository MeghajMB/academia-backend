import { Router } from "express";
import { verifyToken } from "../../../middleware/verify-token";
import { verifyUser } from "../../../middleware/verify-user";
import { container } from "../../../container";
import { ISectionController } from "../../../controllers/course/section/section.interface";
import { Types } from "../../../container/types";

const router = Router();

const sectionController = container.get<ISectionController>(Types.SectionController);

/**
 * POST /api/courses/sections
 * Creates a new section for a course.
 * @returns 201 with created section; 400 for invalid input; 401/403 for unauthorized access.
 */
router.post(
  "/",
  verifyToken,
  verifyUser("instructor"),
  sectionController.addSection.bind(sectionController)
);

/**
 * PUT /api/courses/sections/:sectionId
 * Updates an existing section.
 * @param sectionId - The ID of the section.
 * @returns 200 with updated section; 400 for invalid input; 401/403 for unauthorized access; 404 if section not found.
 */
router
  .route("/:sectionId")
  .all(verifyToken, verifyUser("instructor"))
  .put(sectionController.editSection.bind(sectionController))
  /**
   * DELETE /api/courses/sections/:sectionId
   * Deletes a section from a course.
   * @param sectionId - The ID of the section.
   * @returns 204 on success; 400 for invalid input; 401/403 for unauthorized access; 404 if section not found.
   */
  .delete(sectionController.deleteSection.bind(sectionController));

export default router;
