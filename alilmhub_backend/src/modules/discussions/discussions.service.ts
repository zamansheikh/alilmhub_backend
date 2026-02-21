import { StatusCodes } from "http-status-codes";
import { Types } from "mongoose";
import AppError from "../../errors/AppError";
import { Discussion } from "./discussions.model";
import { TDiscussion, TOpinionStance } from "./discussions.interface";
import { QueryBuilder } from "../../shared/builder/QueryBuilder";

const createDiscussion = async (
  payload: Partial<TDiscussion>,
  userId?: string
) => {
  if (!userId) {
    throw new AppError(StatusCodes.UNAUTHORIZED, "User ID is required");
  }

  const discussionData = {
    ...payload,
    author: new Types.ObjectId(userId),
  };

  const discussion = await Discussion.create(discussionData);
  return discussion;
};

const getAllDiscussions = async (query: Record<string, unknown>) => {
  const discussionQuery = new QueryBuilder(
    Discussion.find({ isDeleted: { $ne: true } }),
    query
  )
    .search(["title", "description"])
    .filter()
    .sort()
    .paginate()
    .fields();

  const result = await discussionQuery.modelQuery
    .populate("author", "name email profileImage")
    .populate("topicId", "slug title")
    .lean();

  const meta = await discussionQuery.countTotal();

  return { result, meta };
};

const getDiscussionBySlug = async (slug: string) => {
  const discussion = await Discussion.findOne({
    slug,
    isDeleted: { $ne: true },
  })
    .populate("author", "name email profileImage reputation")
    .populate("topicId", "slug title")
    .populate("opinions.author", "name email profileImage");

  if (!discussion) {
    throw new AppError(StatusCodes.NOT_FOUND, "Discussion not found");
  }

  // Fire-and-forget view count increment
  Discussion.findOneAndUpdate({ slug }, { $inc: { viewsCount: 1 } }).exec();

  return discussion;
};

const updateDiscussion = async (
  slug: string,
  updateData: Partial<TDiscussion>,
  userId?: string
) => {
  if (!userId) {
    throw new AppError(StatusCodes.UNAUTHORIZED, "User ID is required");
  }

  const discussion = await Discussion.findOne({
    slug,
    isDeleted: { $ne: true },
  });
  if (!discussion) {
    throw new AppError(StatusCodes.NOT_FOUND, "Discussion not found");
  }

  if (discussion.author.toString() !== userId) {
    throw new AppError(
      StatusCodes.FORBIDDEN,
      "You are not authorized to update this discussion"
    );
  }

  const updatedDiscussion = await Discussion.findOneAndUpdate(
    { slug },
    updateData,
    { new: true, runValidators: true }
  )
    .populate("author", "name email profileImage")
    .populate("topicId", "slug title");

  return updatedDiscussion;
};

const deleteDiscussion = async (slug: string, userId?: string) => {
  if (!userId) {
    throw new AppError(StatusCodes.UNAUTHORIZED, "User ID is required");
  }

  const discussion = await Discussion.findOne({
    slug,
    isDeleted: { $ne: true },
  });
  if (!discussion) {
    throw new AppError(StatusCodes.NOT_FOUND, "Discussion not found");
  }

  if (discussion.author.toString() !== userId) {
    throw new AppError(
      StatusCodes.FORBIDDEN,
      "You are not authorized to delete this discussion"
    );
  }

  const deletedDiscussion = await Discussion.findOneAndUpdate(
    { slug },
    { isDeleted: true },
    { new: true }
  );

  return deletedDiscussion;
};

const addOpinion = async (
  slug: string,
  text: string,
  stance: TOpinionStance,
  userId?: string
) => {
  if (!userId) {
    throw new AppError(StatusCodes.UNAUTHORIZED, "User ID is required");
  }

  const discussion = await Discussion.findOne({
    slug,
    isDeleted: { $ne: true },
    status: "open",
  });

  if (!discussion) {
    throw new AppError(
      StatusCodes.NOT_FOUND,
      "Discussion not found or is closed"
    );
  }

  const opinion = {
    author: new Types.ObjectId(userId),
    text,
    stance,
    createdAt: new Date(),
  };

  const countField =
    stance === "supporting" ? "supportingCount" : "opposingCount";

  const updatedDiscussion = await Discussion.findOneAndUpdate(
    { slug, isDeleted: { $ne: true } },
    {
      $push: { opinions: opinion },
      $inc: { [countField]: 1 },
    },
    { new: true }
  )
    .populate("author", "name email profileImage")
    .populate("opinions.author", "name email profileImage");

  return updatedDiscussion;
};

const getDiscussionsByTopic = async (topicId: string) => {
  const discussions = await Discussion.find({
    topicId: new Types.ObjectId(topicId),
    isDeleted: { $ne: true },
  })
    .populate("author", "name email profileImage")
    .sort({ createdAt: -1 });

  return discussions;
};

export const DiscussionServices = {
  createDiscussion,
  getAllDiscussions,
  getDiscussionBySlug,
  updateDiscussion,
  deleteDiscussion,
  addOpinion,
  getDiscussionsByTopic,
};
