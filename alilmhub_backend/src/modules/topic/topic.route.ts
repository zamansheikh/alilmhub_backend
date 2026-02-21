import express, { Router } from "express";
import { TopicController } from "./topic.controller";
import { TopicValidation } from "./topic.dto";
import auth from "../../shared/middlewares/auth";
import validateRequest from "../../shared/middlewares/validateRequest";

const router = express.Router();

// ============================================================================
// IMPORTANT: Route order matters! Specific routes MUST come before generic ones
// ============================================================================

/**
 * @route   GET /api/v1/topic/knowledge-tree
 * @desc    Get knowledge tree structure
 * @access  Public
 */
router.get("/knowledge-tree", TopicController.getKnowledgeTree);

/**
 * @route   GET /api/v1/topic/by-path
 * @desc    Get topics by path
 * @access  Public
 */
router.get("/by-path", TopicController.getTopicsByPath);

/**
 * @route   POST /api/v1/topic
 * @desc    Create a new topic
 * @access  Private
 */
router.post(
  "/",
  auth(),
  validateRequest(TopicValidation.createTopic),
  TopicController.createTopic
);

/**
 * @route   GET /api/v1/topic
 * @desc    Get all topics
 * @access  Public
 */
router.get("/", TopicController.getAllTopics);

/**
 * @route   GET /api/v1/topic/:slug/versions
 * @desc    Get all versions of a topic
 * @access  Public
 */
router.get("/:slug/versions", TopicController.getTopicVersions);

/**
 * @route   GET /api/v1/topic/:slug/versions/:versionId
 * @desc    Get specific version of a topic
 * @access  Public
 */
router.get(
  "/:slug/versions/:versionId",
  validateRequest(TopicValidation.getVersion),
  TopicController.getTopicVersion
);

/**
 * @route   GET /api/v1/topic/:slug/children
 * @desc    Get immediate children of a topic
 * @access  Public
 */
router.get("/:slug/children", TopicController.getTopicChildren);

/**
 * @route   GET /api/v1/topic/:slug/subtree
 * @desc    Get entire subtree of a topic
 * @access  Public
 */
router.get("/:slug/subtree", TopicController.getTopicSubtree);

/**
 * @route   GET /api/v1/topic/:slug/sub-topics
 * @desc    Get sub-topics of a topic
 * @access  Public
 */
router.get("/:slug/sub-topics", TopicController.getSubTopics);

/**
 * @route   GET /api/v1/topic/:slug
 * @desc    Get topic by slug
 * @access  Public
 * @note    MUST be after all specific /:slug/* routes
 */
router.get("/:slug", TopicController.getTopicBySlug);

/**
 * @route   PATCH /api/v1/topic/:slug
 * @desc    Update topic
 * @access  Private
 */
router.patch(
  "/:slug",
  auth(),
  validateRequest(TopicValidation.updateTopic),
  TopicController.updateTopic
);

/**
 * @route   DELETE /api/v1/topic/:slug
 * @desc    Delete topic
 * @access  Private
 */
router.delete("/:slug", auth(), TopicController.deleteTopic);

/**
 * @route   PATCH /api/v1/topic/:slug/add-references
 * @desc    Add references to topic
 * @access  Private
 */
router.patch(
  "/:slug/add-references",
  auth(),
  validateRequest(TopicValidation.addReferences),
  TopicController.addReferences
);

/**
 * @route   PATCH /api/v1/topic/:slug/remove-references
 * @desc    Remove references from topic
 * @access  Private
 */
router.patch(
  "/:slug/remove-references",
  auth(),
  validateRequest(TopicValidation.removeReferences),
  TopicController.removeReferences
);

/**
 * @route   PUT /api/v1/topic/:slug/content
 * @desc    Update topic content (creates new version)
 * @access  Private
 */
router.put(
  "/:slug/content",
  auth(),
  validateRequest(TopicValidation.updateTopicContent),
  TopicController.updateTopicContent
);

/**
 * @route   PATCH /api/v1/topic/:slug/versions/:versionId/review
 * @desc    Approve or reject a pending version (reviewer only)
 * @access  Private (reviewer, scholar, super_admin)
 */
router.patch(
  "/:slug/versions/:versionId/review",
  auth("reviewer", "scholar", "super_admin"),
  validateRequest(TopicValidation.reviewVersion),
  TopicController.reviewTopicVersion
);

export const TopicRoutes: Router = router;
