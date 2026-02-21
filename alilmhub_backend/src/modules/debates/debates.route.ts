import express, { Router } from "express";
import { DebateController } from "./debates.controller";
import { DebateValidation } from "./debates.dto";
import auth from "../../shared/middlewares/auth";
import validateRequest from "../../shared/middlewares/validateRequest";
import { DebateArgumentRoutes } from "../debateArguments/debateArguments.route";
import { DebateVoteRoutes } from "../debateVotes/debateVotes.route";

const router = express.Router();

/**
 * @route   POST /api/v1/debate
 * @desc    Create a new debate
 * @access  Private
 */
router.post(
  "/",
  auth(),
  validateRequest(DebateValidation.createDebate),
  DebateController.createDebate
);

/**
 * @route   GET /api/v1/debate
 * @desc    Get all debates
 * @access  Public
 */
router.get("/", DebateController.getAllDebates);

/**
 * @route   GET /api/v1/debate/topic/:topicId
 * @desc    Get debates by topic
 * @access  Public
 */
router.get("/topic/:topicId", DebateController.getDebatesByTopic);

/**
 * @route   GET /api/v1/debate/user/:userId
 * @desc    Get debates by user
 * @access  Public
 */
router.get("/user/:userId", DebateController.getDebatesByUser);

/**
 * @route   GET /api/v1/debate/:slug
 * @desc    Get debate by slug
 * @access  Public
 */
router.get("/:slug", DebateController.getDebateBySlug);

/**
 * @route   PATCH /api/v1/debate/:slug
 * @desc    Update debate
 * @access  Private (Author only)
 */
router.patch(
  "/:slug",
  auth(),
  validateRequest(DebateValidation.updateDebate),
  DebateController.updateDebate
);

/**
 * @route   DELETE /api/v1/debate/:slug
 * @desc    Delete debate
 * @access  Private (Author only)
 */
router.delete("/:slug", auth(), DebateController.deleteDebate);

/**
 * @route   PATCH /api/v1/debate/:slug/add-references
 * @desc    Add references to debate
 * @access  Private
 */
router.patch(
  "/:slug/add-references",
  auth(),
  validateRequest(DebateValidation.addReferences),
  DebateController.addReferences
);

/**
 * @route   PATCH /api/v1/debate/:slug/remove-references
 * @desc    Remove references from debate
 * @access  Private
 */
router.patch(
  "/:slug/remove-references",
  auth(),
  validateRequest(DebateValidation.removeReferences),
  DebateController.removeReferences
);

/**
 * @route   POST /api/v1/debate/:slug/join
 * @desc    Join a debate
 * @access  Private
 */
router.post(
  "/:slug/join",
  auth(),
  validateRequest(DebateValidation.joinDebate),
  DebateController.joinDebate
);

/**
 * @route   POST /api/v1/debate/:slug/leave
 * @desc    Leave a debate
 * @access  Private
 */
router.post("/:slug/leave", auth(), DebateController.leaveDebate);

/**
 * @route   PATCH /api/v1/debate/:slug/status
 * @desc    Update debate status
 * @access  Private (Author only)
 */
router.patch(
  "/:slug/status",
  auth(),
  validateRequest(DebateValidation.updateStatus),
  DebateController.updateStatus
);

// Sub-resource routes
router.use("/:slug/arguments", DebateArgumentRoutes);
router.use("/:slug/vote", DebateVoteRoutes);

export const DebateRoutes: Router = router;
