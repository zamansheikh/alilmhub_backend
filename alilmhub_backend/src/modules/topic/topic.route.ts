import express, { Router } from "express";
import { TopicController } from "./topic.controller";
import { TopicValidation } from "./topic.dto";
import auth from "../../shared/middlewares/auth";
import validateRequest from "../../shared/middlewares/validateRequest";

const router = express.Router();

/**
 * @route   GET /api/v1/topic/knowledge-tree
 * @desc    Get knowledge tree structure
 * @access  Public
 */
router.get("/knowledge-tree", TopicController.getKnowledgeTree);

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
 * @route   GET /api/v1/topic/:slug
 * @desc    Get topic by slug
 * @access  Public
 */
router.get("/:slug", TopicController.getTopicBySlug);

/**
 * @route   GET /api/v1/topic/:slug/sub-topics
 * @desc    Get sub-topics of a topic
 * @access  Public
 */
router.get("/:slug/sub-topics", TopicController.getSubTopics);

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

export const TopicRoutes: Router = router;
