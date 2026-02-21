import { Router } from "express";
import { DiscussionController } from "./discussions.controller";
import { DiscussionValidation } from "./discussions.dto";
import auth from "../../shared/middlewares/auth";
import validateRequest from "../../shared/middlewares/validateRequest";

const router: Router = Router();

/**
 * @route   POST /api/v1/discussion
 * @desc    Create a new discussion
 * @access  Private
 */
router.post(
  "/",
  auth(),
  validateRequest(DiscussionValidation.createDiscussion),
  DiscussionController.createDiscussion
);

/**
 * @route   GET /api/v1/discussion
 * @desc    Get all discussions
 * @access  Public
 */
router.get("/", DiscussionController.getAllDiscussions);

/**
 * @route   GET /api/v1/discussion/topic/:topicId
 * @desc    Get discussions by topic ID
 * @access  Public
 */
router.get("/topic/:topicId", DiscussionController.getDiscussionsByTopic);

/**
 * @route   GET /api/v1/discussion/:slug
 * @desc    Get discussion by slug
 * @access  Public
 */
router.get("/:slug", DiscussionController.getDiscussionBySlug);

/**
 * @route   PATCH /api/v1/discussion/:slug
 * @desc    Update discussion (author only)
 * @access  Private
 */
router.patch(
  "/:slug",
  auth(),
  validateRequest(DiscussionValidation.updateDiscussion),
  DiscussionController.updateDiscussion
);

/**
 * @route   DELETE /api/v1/discussion/:slug
 * @desc    Delete discussion (author only)
 * @access  Private
 */
router.delete("/:slug", auth(), DiscussionController.deleteDiscussion);

/**
 * @route   POST /api/v1/discussion/:slug/opinion
 * @desc    Add an opinion to a discussion
 * @access  Private
 */
router.post(
  "/:slug/opinion",
  auth(),
  validateRequest(DiscussionValidation.addOpinion),
  DiscussionController.addOpinion
);

export const DiscussionRoutes: Router = router;
