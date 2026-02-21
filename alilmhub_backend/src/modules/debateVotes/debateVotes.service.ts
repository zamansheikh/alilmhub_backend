import { StatusCodes } from "http-status-codes";
import { Types } from "mongoose";
import AppError from "../../errors/AppError";
import { DebateVote } from "./debateVotes.model";
import { Debate } from "../debates/debates.model";

const castVote = async (
  debateSlug: string,
  vote: "supporting" | "opposing",
  userId?: string
) => {
  if (!userId) throw new AppError(StatusCodes.UNAUTHORIZED, "User ID is required");

  const debate = await Debate.findOne({ slug: debateSlug, isDeleted: { $ne: true } });
  if (!debate) throw new AppError(StatusCodes.NOT_FOUND, "Debate not found");
  if (debate.status !== "open")
    throw new AppError(StatusCodes.BAD_REQUEST, "Cannot vote on a closed debate");

  const debateId = debate._id as Types.ObjectId;
  const userObjectId = new Types.ObjectId(userId);

  // Check for existing vote
  const existing = await DebateVote.findOne({ debateId, userId: userObjectId });

  if (existing) {
    if (existing.vote === vote) {
      // Remove vote (toggle off)
      await DebateVote.deleteOne({ _id: existing._id });
      const decField = vote === "supporting" ? "supportingVotesCount" : "opposingVotesCount";
      await Debate.findByIdAndUpdate(debateId, { $inc: { [decField]: -1 } });
      return { message: "Vote removed", vote: null };
    } else {
      // Switch vote
      const oldField = existing.vote === "supporting" ? "supportingVotesCount" : "opposingVotesCount";
      const newField = vote === "supporting" ? "supportingVotesCount" : "opposingVotesCount";
      existing.vote = vote;
      await existing.save();
      await Debate.findByIdAndUpdate(debateId, {
        $inc: { [oldField]: -1, [newField]: 1 },
      });
      return { message: "Vote updated", vote };
    }
  }

  // New vote
  await DebateVote.create({ debateId, userId: userObjectId, vote });
  const incField = vote === "supporting" ? "supportingVotesCount" : "opposingVotesCount";
  await Debate.findByIdAndUpdate(debateId, { $inc: { [incField]: 1 } });
  return { message: "Vote cast", vote };
};

const getUserVote = async (debateSlug: string, userId?: string) => {
  if (!userId) return null;

  const debate = await Debate.findOne({ slug: debateSlug, isDeleted: { $ne: true } });
  if (!debate) return null;

  const voteDoc = await DebateVote.findOne({
    debateId: debate._id,
    userId: new Types.ObjectId(userId),
  });
  return voteDoc?.vote ?? null;
};

export const DebateVoteServices = { castVote, getUserVote };
