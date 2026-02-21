import { Router } from "express";
import { DebateArgumentController } from "./debateArguments.controller";
import { DebateArgumentValidation } from "./debateArguments.dto";
import auth from "../../shared/middlewares/auth";
import validateRequest from "../../shared/middlewares/validateRequest";

const router: Router = Router({ mergeParams: true });

/**
 * @route   POST /api/v1/debate/:slug/arguments
 * @desc    Add argument to a debate
 * @access  Private (must be joined member)
 */
router.post(
  "/",
  auth(),
  validateRequest(DebateArgumentValidation.createArgument),
  DebateArgumentController.createArgument
);

/**
 * @route   GET /api/v1/debate/:slug/arguments
 * @desc    Get all arguments for a debate
 * @access  Public
 */
router.get("/", DebateArgumentController.getArgumentsByDebate);

/**
 * @route   PATCH /api/v1/debate/:slug/arguments/:argumentId
 * @desc    Update an argument
 * @access  Private (author only)
 */
router.patch(
  "/:argumentId",
  auth(),
  validateRequest(DebateArgumentValidation.updateArgument),
  DebateArgumentController.updateArgument
);

/**
 * @route   DELETE /api/v1/debate/:slug/arguments/:argumentId
 * @desc    Delete an argument
 * @access  Private (author only)
 */
router.delete("/:argumentId", auth(), DebateArgumentController.deleteArgument);

/**
 * @route   POST /api/v1/debate/:slug/arguments/:argumentId/vote
 * @desc    Vote on an argument (up/down)
 * @access  Private
 */
router.post("/:argumentId/vote", auth(), DebateArgumentController.voteArgument);

export const DebateArgumentRoutes: Router = router;
