import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { DebateServices } from "./debates.service";
import catchAsync from "../../shared/util/catchAsync";
import sendResponse from "../../shared/util/sendResponse";

const createDebate = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?._id?.toString();
  const debate = await DebateServices.createDebate(req.body, userId);
  sendResponse(res, {
    statusCode: StatusCodes.CREATED,
    success: true,
    message: "Debate created successfully",
    data: debate,
  });
});

const getAllDebates = catchAsync(async (req: Request, res: Response) => {
  const debatesRes = await DebateServices.getAllDebates(req.query);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Debates retrieved successfully",
    data: debatesRes.result,
    meta: debatesRes.meta,
  });
});

const getDebateBySlug = catchAsync(async (req: Request, res: Response) => {
  const debate = await DebateServices.getDebateBySlug(req.params.slug as string);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Debate retrieved successfully",
    data: debate,
  });
});

const updateDebate = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?._id?.toString();
  const debate = await DebateServices.updateDebate(
    req.params.slug as string,
    req.body,
    userId
  );
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Debate updated successfully",
    data: debate,
  });
});

const deleteDebate = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?._id?.toString();
  await DebateServices.deleteDebate(req.params.slug as string, userId);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Debate deleted successfully",
    data: null,
  });
});

const addReferences = catchAsync(async (req: Request, res: Response) => {
  const { referenceIds } = req.body;
  const debate = await DebateServices.addReferences(req.params.slug as string, referenceIds);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "References added successfully",
    data: debate,
  });
});

const removeReferences = catchAsync(async (req: Request, res: Response) => {
  const { referenceIds } = req.body;
  const debate = await DebateServices.removeReferences(
    req.params.slug as string,
    referenceIds
  );
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "References removed successfully",
    data: debate,
  });
});

const joinDebate = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?._id?.toString();
  const { side } = req.body;
  const debate = await DebateServices.joinDebate(req.params.slug as string, userId, side);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Joined debate successfully",
    data: debate,
  });
});

const leaveDebate = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?._id?.toString();
  const debate = await DebateServices.leaveDebate(req.params.slug as string, userId);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Left debate successfully",
    data: debate,
  });
});

const updateStatus = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?._id?.toString();
  const { status } = req.body;
  const debate = await DebateServices.updateStatus(req.params.slug as string, status, userId);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Debate status updated successfully",
    data: debate,
  });
});

const getDebatesByTopic = catchAsync(async (req: Request, res: Response) => {
  const debatesRes = await DebateServices.getDebatesByTopic(
    req.params.topicId as string,
    req.query
  );
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Topic debates retrieved successfully",
    data: debatesRes.result,
    meta: debatesRes.meta,
  });
});

const getDebatesByUser = catchAsync(async (req: Request, res: Response) => {
  const debatesRes = await DebateServices.getDebatesByUser(
    req.params.userId as string,
    req.query
  );
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "User debates retrieved successfully",
    data: debatesRes.result,
    meta: debatesRes.meta,
  });
});

export const DebateController = {
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
