import { StatusCodes } from "http-status-codes";
import { Types } from "mongoose";
import AppError from "../../errors/AppError";
import { DebateArgument } from "./debateArguments.model";
import { Debate } from "../debates/debates.model";
import { TDebateArguments } from "./debateArguments.interface";

const createArgument = async (
  debateSlug: string,
  payload: Partial<TDebateArguments>,
  userId?: string
) => {
  if (!userId) throw new AppError(StatusCodes.UNAUTHORIZED, "User ID is required");

  const debate = await Debate.findOne({ slug: debateSlug, isDeleted: { $ne: true } });
  if (!debate) throw new AppError(StatusCodes.NOT_FOUND, "Debate not found");
  if (debate.status !== "open")
    throw new AppError(StatusCodes.BAD_REQUEST, "Cannot add arguments to a closed debate");

  const argument = await DebateArgument.create({
    ...payload,
    debateId: debate._id,
    author: new Types.ObjectId(userId),
  });

  return argument.populate([
    { path: "author", select: "name email profileImage" },
    { path: "references", select: "slug title type" },
  ]);
};

const getArgumentsByDebate = async (debateSlug: string) => {
  const debate = await Debate.findOne({ slug: debateSlug, isDeleted: { $ne: true } });
  if (!debate) throw new AppError(StatusCodes.NOT_FOUND, "Debate not found");

  return DebateArgument.find({ debateId: debate._id, isDeleted: { $ne: true } })
    .populate("author", "name email profileImage")
    .populate("references", "slug title type")
    .sort({ createdAt: -1 });
};

const updateArgument = async (
  argumentId: string,
  updateData: Partial<TDebateArguments>,
  userId?: string
) => {
  if (!userId) throw new AppError(StatusCodes.UNAUTHORIZED, "User ID is required");

  const arg = await DebateArgument.findOne({ _id: argumentId, isDeleted: { $ne: true } });
  if (!arg) throw new AppError(StatusCodes.NOT_FOUND, "Argument not found");
  if (arg.author.toString() !== userId)
    throw new AppError(StatusCodes.FORBIDDEN, "Not authorized to update this argument");

  return DebateArgument.findByIdAndUpdate(argumentId, updateData, { new: true, runValidators: true })
    .populate("author", "name email profileImage")
    .populate("references", "slug title type");
};

const deleteArgument = async (argumentId: string, userId?: string) => {
  if (!userId) throw new AppError(StatusCodes.UNAUTHORIZED, "User ID is required");

  const arg = await DebateArgument.findOne({ _id: argumentId, isDeleted: { $ne: true } });
  if (!arg) throw new AppError(StatusCodes.NOT_FOUND, "Argument not found");
  if (arg.author.toString() !== userId)
    throw new AppError(StatusCodes.FORBIDDEN, "Not authorized to delete this argument");

  return DebateArgument.findByIdAndUpdate(argumentId, { isDeleted: true }, { new: true });
};

const voteArgument = async (
  argumentId: string,
  voteType: "up" | "down",
  userId?: string
) => {
  if (!userId) throw new AppError(StatusCodes.UNAUTHORIZED, "User ID is required");

  const arg = await DebateArgument.findOne({ _id: argumentId, isDeleted: { $ne: true } });
  if (!arg) throw new AppError(StatusCodes.NOT_FOUND, "Argument not found");

  const field = voteType === "up" ? "upVotes" : "downVotes";
  return DebateArgument.findByIdAndUpdate(
    argumentId,
    { $inc: { [field]: 1 } },
    { new: true }
  ).populate("author", "name email profileImage");
};

export const DebateArgumentServices = {
  createArgument,
  getArgumentsByDebate,
  updateArgument,
  deleteArgument,
  voteArgument,
};
