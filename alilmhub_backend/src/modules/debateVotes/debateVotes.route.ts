import { Router } from "express";
import { DebateVoteController } from "./debateVotes.controller";
import auth from "../../shared/middlewares/auth";
import { z } from "zod";
import validateRequest from "../../shared/middlewares/validateRequest";

const router: Router = Router({ mergeParams: true });

const castVoteDto = z.object({
  body: z.object({
    vote: z.enum(["supporting", "opposing"], {
      message: "Vote must be 'supporting' or 'opposing'",
    }),
  }),
});

/**
 * @route   POST /api/v1/debate/:slug/vote
 * @desc    Cast or toggle vote on a debate
 * @access  Private
 */
router.post("/", auth(), validateRequest(castVoteDto), DebateVoteController.castVote);

/**
 * @route   GET /api/v1/debate/:slug/vote
 * @desc    Get the current user's vote on a debate
 * @access  Private
 */
router.get("/", auth(), DebateVoteController.getUserVote);

export const DebateVoteRoutes: Router = router;
