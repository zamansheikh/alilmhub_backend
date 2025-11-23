import mongoose from "mongoose";
import AppError from "../../errors/AppError";
import {
  OneTimeCodeDto,
  TCreateOneTimeCodeDto,
  TValidateOneTimeCodeDto,
} from "./otp.dto";
import { TOneTimeCode } from "./otp.interface";
import { OneTimeCode } from "./otp.model";
import bcrypt from "bcryptjs";
const createOtpEntry = async (
  otpEntry: TCreateOneTimeCodeDto,
  session?: mongoose.ClientSession
): Promise<Partial<TOneTimeCode>> => {
  const parseResult = OneTimeCodeDto.createOneTimeCodeDto.safeParse(otpEntry);
  if (!parseResult.success) {
    throw new AppError(400, "Invalid OTP entry");
  }

const oldOtpEntry = await OneTimeCode.findOneAndDelete({
    userId: parseResult.data.userId,
    reason: parseResult.data.reason,
  }).session(session || null);

  const hashedOtp = bcrypt.hashSync(parseResult.data.oneTimeCode, 10);

  const newOtpEntry = await OneTimeCode.create(
    [
      {
        userId: parseResult.data.userId,
        reason: parseResult.data.reason,
        oneTimeCodeHash: hashedOtp,
        expireAt: parseResult.data.expireAt,
      },
    ],
    { session }
  );
  if (!newOtpEntry[0]) {
    throw new AppError(500, "Failed to create OTP entry");
  }
  return newOtpEntry[0];
};

const validateOtp = async ({
  userId,
  reason,
  oneTimeCode,
}: TValidateOneTimeCodeDto): Promise<boolean> => {
  const parseResult = OneTimeCodeDto.validateOneTimeCodeDto.safeParse({
    userId,
    reason,
    oneTimeCode,
  });
  if (!parseResult.success) {
    throw new AppError(400, "Invalid OTP data");
  }

  const otpEntry = await OneTimeCode.findOne({ userId, reason });
  if (!otpEntry) {
    throw new AppError(404, "OTP entry not found");
  }
  const isValid = bcrypt.compareSync(oneTimeCode, otpEntry.oneTimeCodeHash);
  if (!isValid) {
    throw new AppError(400, "Invalid OTP");
  }
  const expireAt = otpEntry.expireAt ? new Date(otpEntry.expireAt) : null;
  if (expireAt && !isNaN(expireAt.getTime()) && expireAt < new Date()) {
    await OneTimeCode.findByIdAndDelete(otpEntry._id);
    throw new AppError(400, "OTP expired");
  }

  await OneTimeCode.findByIdAndDelete(otpEntry._id);
  return true;
};

export const OtpService = {
  createOtpEntry,
  validateOtp,
};
