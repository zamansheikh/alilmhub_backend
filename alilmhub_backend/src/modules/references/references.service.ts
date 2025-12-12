import { StatusCodes } from "http-status-codes";
import AppError from "../../errors/AppError";
import { Reference } from "./references.model";
import { TReferences } from "./references.interface";
import { QueryBuilder } from "../../shared/builder/QueryBuilder";
import { Types } from "mongoose";
const createReference = async (
  payload: Partial<TReferences>,
  userId?: string
) => {
  const referenceData = {
    ...payload,
    ...(userId && { createdBy: new Types.ObjectId(userId) }),
  };

  const reference = await Reference.create(referenceData);
  return reference;
};

const getAllReferences = async (query: Record<string, unknown>) => {
  const referenceQuery = new QueryBuilder(Reference.find(), query)
    .search(["title", "author"])
    .filter()
    .sort()
    .paginate()
    .fields();

  const result = await referenceQuery.modelQuery.lean();
  const meta = await referenceQuery.countTotal();

  return { result, meta };
};

const getReferenceBySlug = async (slug: string) => {
  const reference = await Reference.findOne({
    $or: [{ slug }],
  }).populate("verifiedBy", "name email");
  if (!reference) {
    throw new AppError(StatusCodes.NOT_FOUND, "Reference not found");
  }
  return reference;
};

const updateReference = async (
  slug: string,
  updateData: Partial<TReferences>
) => {
  const reference = await Reference.findOne({ slug });
  if (!reference) {
    throw new AppError(StatusCodes.NOT_FOUND, "Reference not found");
  }

  const updatedReference = await Reference.findOneAndUpdate(
    { slug },
    updateData,
    { new: true, runValidators: true }
  );

  return updatedReference;
};

const deleteReference = async (slug: string) => {
  const reference = await Reference.findOneAndDelete({ slug });
  if (!reference) {
    throw new AppError(StatusCodes.NOT_FOUND, "Reference not found");
  }
  return reference;
};

const verifyReference = async (slug: string, userId?: string) => {
  if (!userId) {
    throw new AppError(StatusCodes.UNAUTHORIZED, "User ID is required");
  }
  
  const reference = await Reference.findOne({ slug });
  if (!reference) {
    throw new AppError(StatusCodes.NOT_FOUND, "Reference not found");
  }

  const updatedReference = await Reference.findOneAndUpdate(
    { slug },
    { verified: true, verifiedBy: new Types.ObjectId(userId) },
    { new: true }
  ).populate("verifiedBy", "name email");

  return updatedReference;
};

const getBulkReferences = async (ids: string[]) => {
  if (!ids || ids.length === 0) {
    throw new AppError(StatusCodes.BAD_REQUEST, "Reference IDs are required");
  }
  console.log(ids);
  const references = await Reference.find({
    _id: { $in: ids },
  }).populate("verifiedBy", "name email");

  return references;
};

export const ReferenceServices = {
  createReference,
  getAllReferences,
  getReferenceBySlug,
  updateReference,
  deleteReference,
  verifyReference,
  getBulkReferences,
};
