import { StatusCodes } from "http-status-codes";
import { Types } from "mongoose";
import AppError from "../../errors/AppError";
import { Debate } from "./debates.model";
import { TDebates } from "./debates.interface";
import { QueryBuilder } from "../../shared/builder/QueryBuilder";

const createDebate = async (payload: Partial<TDebates>, userId?: string) => {
  if (!userId) {
    throw new AppError(StatusCodes.UNAUTHORIZED, "User ID is required");
  }
  
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
    .populate({ path: "supportingMembers", select: "name profileImage", options: { limit: 10 } })
    .populate({ path: "opposingMembers", select: "name profileImage", options: { limit: 10 } })
    .lean();

  const meta = await debateQuery.countTotal();

  return { result, meta };
};

const getDebateBySlug = async (slug: string) => {
  const debate = await Debate.findOne({ slug, isDeleted: { $ne: true } })
    .populate("author", "name email profileImage reputation")
    .populate("topicId", "slug title")
    .populate("references", "slug title type author verified")
    .populate({ path: "supportingMembers", select: "name email profileImage reputation", options: { limit: 50 } })
    .populate({ path: "opposingMembers", select: "name email profileImage reputation", options: { limit: 50 } });

  if (!debate) {
    throw new AppError(StatusCodes.NOT_FOUND, "Debate not found");
  }

  // Fire-and-forget view count increment (non-blocking)
  Debate.findOneAndUpdate({ slug }, { $inc: { viewsCount: 1 } }).exec();

  return debate;
};

const updateDebate = async (
  slug: string,
  updateData: Partial<TDebates>,
  userId?: string
) => {
  if (!userId) {
    throw new AppError(StatusCodes.UNAUTHORIZED, "User ID is required");
  }
  
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

const deleteDebate = async (slug: string, userId?: string) => {
  if (!userId) {
    throw new AppError(StatusCodes.UNAUTHORIZED, "User ID is required");
  }
  
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
  const objectIds = referenceIds.map((id) => new Types.ObjectId(id));

  const updatedDebate = await Debate.findOneAndUpdate(
    { slug, isDeleted: { $ne: true } },
    { $addToSet: { references: { $each: objectIds } } },
    { new: true }
  ).populate("references", "slug title type");

  if (!updatedDebate) {
    throw new AppError(StatusCodes.NOT_FOUND, "Debate not found");
  }

  return updatedDebate;
};

const removeReferences = async (slug: string, referenceIds: string[]) => {
  const objectIds = referenceIds.map((id) => new Types.ObjectId(id));

  const updatedDebate = await Debate.findOneAndUpdate(
    { slug, isDeleted: { $ne: true } },
    { $pull: { references: { $in: objectIds } } },
    { new: true }
  ).populate("references", "slug title type");

  if (!updatedDebate) {
    throw new AppError(StatusCodes.NOT_FOUND, "Debate not found");
  }

  return updatedDebate;
};

const joinDebate = async (slug: string, userId?: string, side?: "supporting" | "opposing") => {
  if (!userId) {
    throw new AppError(StatusCodes.UNAUTHORIZED, "User ID is required");
  }
  if (!side) {
    throw new AppError(StatusCodes.BAD_REQUEST, "Side is required");
  }

  const userObjectId = new Types.ObjectId(userId);
  const updateField = side === "supporting" ? "supportingMembers" : "opposingMembers";

  // Atomic operation: check status, verify not already joined, and add in one query
  const updatedDebate = await Debate.findOneAndUpdate(
    { 
      slug, 
      isDeleted: { $ne: true },
      status: "open",
      supportingMembers: { $ne: userObjectId },
      opposingMembers: { $ne: userObjectId }
    },
    { $addToSet: { [updateField]: userObjectId } },
    { new: true }
  )
    .populate("supportingMembers", "name email profileImage")
    .populate("opposingMembers", "name email profileImage");

  if (!updatedDebate) {
    // Need to determine why it failed - fetch debate to give specific error
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
    
    // If we reach here, user is already in debate
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      "You have already joined this debate"
    );
  }

  return updatedDebate;
};

const leaveDebate = async (slug: string, userId?: string) => {
  if (!userId) {
    throw new AppError(StatusCodes.UNAUTHORIZED, "User ID is required");
  }
  
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

const updateStatus = async (slug: string, status: "open" | "closed" | "archived", userId?: string) => {
  if (!userId) {
    throw new AppError(StatusCodes.UNAUTHORIZED, "User ID is required");
  }
  
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
