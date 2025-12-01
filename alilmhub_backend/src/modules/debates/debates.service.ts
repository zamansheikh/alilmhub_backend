import { StatusCodes } from "http-status-codes";
import { Types } from "mongoose";
import AppError from "../../errors/AppError";
import { Debate } from "./debates.model";
import { TDebates } from "./debates.interface";
import { QueryBuilder } from "../../shared/builder/QueryBuilder";

const createDebate = async (payload: Partial<TDebates>, userId: string) => {
  const debateData = {
    ...payload,
    author: new Types.ObjectId(userId),
  };
  const debate = await Debate.create(debateData);
  return debate;
};

const getAllDebates = async (query: Record<string, unknown>) => {
  const debateQuery = new QueryBuilder(
    Debate.find({ isDeleted: { $ne: true } }),
    query
  )
    .search(["title", "titleDescription", "description"])
    .filter()
    .sort()
    .paginate()
    .fields();

  const result = await debateQuery.modelQuery
    .populate("author", "name email profileImage")
    .populate("topicId", "slug title")
    .populate("references", "slug title type")
    .populate("supportingMembers", "name email profileImage")
    .populate("opposingMembers", "name email profileImage");

  const meta = await debateQuery.countTotal();

  return { result, meta };
};

const getDebateBySlug = async (slug: string) => {
  const debate = await Debate.findOne({ slug, isDeleted: { $ne: true } })
    .populate("author", "name email profileImage reputation")
    .populate("topicId", "slug title")
    .populate("references", "slug title type author verified")
    .populate("supportingMembers", "name email profileImage reputation")
    .populate("opposingMembers", "name email profileImage reputation");

  if (!debate) {
    throw new AppError(StatusCodes.NOT_FOUND, "Debate not found");
  }

  await Debate.findOneAndUpdate({ slug }, { $inc: { viewsCount: 1 } });

  return debate;
};

const updateDebate = async (
  slug: string,
  updateData: Partial<TDebates>,
  userId: string
) => {
  const debate = await Debate.findOne({ slug, isDeleted: { $ne: true } });
  if (!debate) {
    throw new AppError(StatusCodes.NOT_FOUND, "Debate not found");
  }

  // Only author can update debate
  if (debate.author.toString() !== userId) {
    throw new AppError(
      StatusCodes.FORBIDDEN,
      "You are not authorized to update this debate"
    );
  }

  const updatedDebate = await Debate.findOneAndUpdate(
    { slug },
    updateData,
    { new: true, runValidators: true }
  )
    .populate("author", "name email profileImage")
    .populate("topicId", "slug title")
    .populate("references", "slug title type")
    .populate("supportingMembers", "name email profileImage")
    .populate("opposingMembers", "name email profileImage");

  return updatedDebate;
};

const deleteDebate = async (slug: string, userId: string) => {
  const debate = await Debate.findOne({ slug, isDeleted: { $ne: true } });
  if (!debate) {
    throw new AppError(StatusCodes.NOT_FOUND, "Debate not found");
  }

  // Only author can delete debate
  if (debate.author.toString() !== userId) {
    throw new AppError(
      StatusCodes.FORBIDDEN,
      "You are not authorized to delete this debate"
    );
  }

  const deletedDebate = await Debate.findOneAndUpdate(
    { slug },
    { isDeleted: true },
    { new: true }
  );

  return deletedDebate;
};

const addReferences = async (slug: string, referenceIds: string[]) => {
  const debate = await Debate.findOne({ slug, isDeleted: { $ne: true } });
  if (!debate) {
    throw new AppError(StatusCodes.NOT_FOUND, "Debate not found");
  }

  const objectIds = referenceIds.map((id) => new Types.ObjectId(id));

  const updatedDebate = await Debate.findOneAndUpdate(
    { slug },
    { $addToSet: { references: { $each: objectIds } } },
    { new: true }
  ).populate("references", "slug title type");

  return updatedDebate;
};

const removeReferences = async (slug: string, referenceIds: string[]) => {
  const debate = await Debate.findOne({ slug, isDeleted: { $ne: true } });
  if (!debate) {
    throw new AppError(StatusCodes.NOT_FOUND, "Debate not found");
  }

  const objectIds = referenceIds.map((id) => new Types.ObjectId(id));

  const updatedDebate = await Debate.findOneAndUpdate(
    { slug },
    { $pull: { references: { $in: objectIds } } },
    { new: true }
  ).populate("references", "slug title type");

  return updatedDebate;
};

const joinDebate = async (slug: string, userId: string, side: "supporting" | "opposing") => {
  const debate = await Debate.findOne({ slug, isDeleted: { $ne: true } });
  if (!debate) {
    throw new AppError(StatusCodes.NOT_FOUND, "Debate not found");
  }

  if (debate.status !== "open") {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      "Cannot join a debate that is not open"
    );
  }

  const userObjectId = new Types.ObjectId(userId);

  // Check if user is already on any side
  const isSupporting = debate.supportingMembers.some(
    (member) => member.toString() === userId
  );
  const isOpposing = debate.opposingMembers.some(
    (member) => member.toString() === userId
  );

  if (isSupporting || isOpposing) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      "You have already joined this debate"
    );
  }

  const updateField = side === "supporting" ? "supportingMembers" : "opposingMembers";

  const updatedDebate = await Debate.findOneAndUpdate(
    { slug },
    { $addToSet: { [updateField]: userObjectId } },
    { new: true }
  )
    .populate("supportingMembers", "name email profileImage")
    .populate("opposingMembers", "name email profileImage");

  return updatedDebate;
};

const leaveDebate = async (slug: string, userId: string) => {
  const debate = await Debate.findOne({ slug, isDeleted: { $ne: true } });
  if (!debate) {
    throw new AppError(StatusCodes.NOT_FOUND, "Debate not found");
  }

  const userObjectId = new Types.ObjectId(userId);

  const updatedDebate = await Debate.findOneAndUpdate(
    { slug },
    {
      $pull: {
        supportingMembers: userObjectId,
        opposingMembers: userObjectId,
      },
    },
    { new: true }
  )
    .populate("supportingMembers", "name email profileImage")
    .populate("opposingMembers", "name email profileImage");

  return updatedDebate;
};

const updateStatus = async (slug: string, status: "open" | "closed" | "archived", userId: string) => {
  const debate = await Debate.findOne({ slug, isDeleted: { $ne: true } });
  if (!debate) {
    throw new AppError(StatusCodes.NOT_FOUND, "Debate not found");
  }

  // Only author can update status
  if (debate.author.toString() !== userId) {
    throw new AppError(
      StatusCodes.FORBIDDEN,
      "You are not authorized to update this debate status"
    );
  }

  const updatedDebate = await Debate.findOneAndUpdate(
    { slug },
    { status },
    { new: true }
  )
    .populate("author", "name email profileImage")
    .populate("topicId", "slug title");

  return updatedDebate;
};

const getDebatesByTopic = async (topicId: string, query: Record<string, unknown>) => {
  const debateQuery = new QueryBuilder(
    Debate.find({ topicId: new Types.ObjectId(topicId), isDeleted: { $ne: true } }),
    query
  )
    .filter()
    .sort()
    .paginate()
    .fields();

  const result = await debateQuery.modelQuery
    .populate("author", "name email profileImage")
    .populate("references", "slug title type")
    .populate("supportingMembers", "name email profileImage")
    .populate("opposingMembers", "name email profileImage");

  const meta = await debateQuery.countTotal();

  return { result, meta };
};

const getDebatesByUser = async (userId: string, query: Record<string, unknown>) => {
  const userObjectId = new Types.ObjectId(userId);
  
  const debateQuery = new QueryBuilder(
    Debate.find({
      $or: [
        { author: userObjectId },
        { supportingMembers: userObjectId },
        { opposingMembers: userObjectId },
      ],
      isDeleted: { $ne: true },
    }),
    query
  )
    .filter()
    .sort()
    .paginate()
    .fields();

  const result = await debateQuery.modelQuery
    .populate("author", "name email profileImage")
    .populate("topicId", "slug title")
    .populate("references", "slug title type")
    .populate("supportingMembers", "name email profileImage")
    .populate("opposingMembers", "name email profileImage");

  const meta = await debateQuery.countTotal();

  return { result, meta };
};

export const DebateServices = {
  createDebate,
  getAllDebates,
  getDebateBySlug,
  updateDebate,
  deleteDebate,
  addReferences,
  removeReferences,
  joinDebate,
  leaveDebate,
  updateStatus,
  getDebatesByTopic,
  getDebatesByUser,
};
