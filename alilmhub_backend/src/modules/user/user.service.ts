import { StatusCodes } from "http-status-codes";
import AppError from "../../errors/AppError";
import { User } from "./user.model";

import { QueryBuilder } from "../../shared/builder/QueryBuilder";
import { unlinkFileSync } from "../../shared/util/unlinkFile";

const getAllUsers = async (query: Record<string, unknown>) => {
  const userQuery = new QueryBuilder(User.find(), query)
    .search(["firstName", "lastName", "email"])
    .filter()
    .sort()
    .paginate()
    .fields();

  const result = await userQuery.modelQuery.lean();
  const meta = await userQuery.countTotal();

  return { result, meta };
};
const getUserById = async (id: string) => {
  const user = await User.findById(id);
  if (!user) {
    throw new AppError(StatusCodes.NOT_FOUND, "User not found");
  }
  return user;
};
const updateUser = async (id: string, updateData: any) => {
  const user = await User.findById(id);

  if (!user) {
    throw new AppError(StatusCodes.NOT_FOUND, "User not found");
  }

  if (updateData.image && user.profileImage) {
    unlinkFileSync(user.profileImage);
  }

  const updatedUser = await User.findByIdAndUpdate(id, updateData, {
    new: true,
  });

  if (!updatedUser) {
    throw new AppError(StatusCodes.NOT_FOUND, "User update failed");
  }
  return updatedUser;
};
const updateUserActivationStatus = async (
  id: string,
  status: "active" | "delete"
) => {
  console.log(status);
  console.log(id);

  const user = await User.findByIdAndUpdate(
    id,
    { status: status },
    { new: true }
  );
  console.log(user);
  if (!user) {
    throw new AppError(StatusCodes.NOT_FOUND, "User not found");
  }

  return user;
};
const updateUserRole = async (id: string, role: "USER" | "ADMIN") => {
  const user = await User.findByIdAndUpdate(
    id,
    { $set: { role } },
    { new: true }
  );
  if (!user) {
    throw new AppError(StatusCodes.NOT_FOUND, "User not found");
  }

  return user;
};

const getMe = async (userId?: string) => {
  if (!userId) {
    throw new AppError(StatusCodes.UNAUTHORIZED, "User ID is required");
  }
  
  // If not cached, query the database using lean with virtuals enabled.
  const user = await User.findById(userId).lean({
    virtuals: true,
  });
  if (!user) {
    throw new AppError(StatusCodes.NOT_FOUND, "User not found");
  }
  return user;
};

export const UserServices = {
  getAllUsers,
  getUserById,
  updateUser,
  updateUserActivationStatus,
  updateUserRole,
  getMe,
};
