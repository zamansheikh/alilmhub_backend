import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { DebateVoteServices } from "./debateVotes.service";
import catchAsync from "../../shared/util/catchAsync";
import sendResponse from "../../shared/util/sendResponse";

const castVote = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?._id?.toString();
  const { vote } = req.body;
  const result = await DebateVoteServices.castVote(
    String(req.params.slug),
    vote,
    userId
  );
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: result.message,
    data: result,
  });
});

const getUserVote = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?._id?.toString();
  const vote = await DebateVoteServices.getUserVote(
    String(req.params.slug),
    userId
  );
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "User vote retrieved",
    data: { vote },
  });
});

export const DebateVoteController = { castVote, getUserVote };
