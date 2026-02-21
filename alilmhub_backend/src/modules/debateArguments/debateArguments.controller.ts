import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { DebateArgumentServices } from "./debateArguments.service";
import catchAsync from "../../shared/util/catchAsync";
import sendResponse from "../../shared/util/sendResponse";

const createArgument = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?._id?.toString();
  const argument = await DebateArgumentServices.createArgument(
    String(req.params.slug),
    req.body,
    userId
  );
  sendResponse(res, {
    statusCode: StatusCodes.CREATED,
    success: true,
    message: "Argument added successfully",
    data: argument,
  });
});

const getArgumentsByDebate = catchAsync(async (req: Request, res: Response) => {
  const arguments_ = await DebateArgumentServices.getArgumentsByDebate(
    String(req.params.slug)
  );
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Arguments retrieved successfully",
    data: arguments_,
  });
});

const updateArgument = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?._id?.toString();
  const argument = await DebateArgumentServices.updateArgument(
    String(req.params.argumentId),
    req.body,
    userId
  );
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Argument updated successfully",
    data: argument,
  });
});

const deleteArgument = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?._id?.toString();
  await DebateArgumentServices.deleteArgument(
    String(req.params.argumentId),
    userId
  );
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Argument deleted successfully",
    data: null,
  });
});

const voteArgument = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?._id?.toString();
  const { voteType } = req.body;
  const argument = await DebateArgumentServices.voteArgument(
    String(req.params.argumentId),
    voteType,
    userId
  );
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Vote recorded",
    data: argument,
  });
});

export const DebateArgumentController = {
  createArgument,
  getArgumentsByDebate,
  updateArgument,
  deleteArgument,
  voteArgument,
};
