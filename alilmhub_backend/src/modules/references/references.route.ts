import express, { Router } from "express";
import { ReferenceController } from "./references.controller";
import { ReferenceValidation } from "./references.dto";
import auth from "../../shared/middlewares/auth";
import validateRequest from "../../shared/middlewares/validateRequest";

const router = express.Router();

/**
 * @route   POST /api/v1/reference
 * @desc    Create a new reference
 * @access  Private
 */
router.post(
  "/",
  auth(),
  validateRequest(ReferenceValidation.createReference),
  ReferenceController.createReference
);

/**
 * @route   POST /api/v1/reference/bulk
 * @desc    Get bulk references by IDs
 * @access  Public
 */
router.post(
  "/bulk",
  validateRequest(ReferenceValidation.getBulkReferences),
  ReferenceController.getBulkReferences
);

/**
 * @route   GET /api/v1/reference
 * @desc    Get all references
 * @access  Public
 */
router.get("/", ReferenceController.getAllReferences);

/**
 * @route   GET /api/v1/reference/:slug
 * @desc    Get reference by slug
 * @access  Public
 */
router.get("/:slug", ReferenceController.getReferenceBySlug);

/**
 * @route   PATCH /api/v1/reference/:slug
 * @desc    Update reference
 * @access  Private
 */
router.patch(
  "/:slug",
  auth(),
  validateRequest(ReferenceValidation.updateReference),
  ReferenceController.updateReference
);

/**
 * @route   DELETE /api/v1/reference/:slug
 * @desc    Delete reference
 * @access  Private
 */
router.delete("/:slug", auth(), ReferenceController.deleteReference);

/**
 * @route   PATCH /api/v1/reference/:slug/verify
 * @desc    Verify reference
 * @access  Private (Reviewer / Scholar / Super Admin)
 */
router.patch("/:slug/verify", auth("reviewer", "scholar", "super_admin"), ReferenceController.verifyReference);

export const ReferenceRoutes: Router = router;
