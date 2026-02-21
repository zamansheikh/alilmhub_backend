import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { DiscussionServices } from "./discussions.service";
import catchAsync from "../../shared/util/catchAsync";
import sendResponse from "../../shared/util/sendResponse";

const createDiscussion = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?._id?.toString();
  const discussion = await DiscussionServices.createDiscussion(
    req.body,
    userId
  );
  sendResponse(res, {
    statusCode: StatusCodes.CREATED,
    success: true,
    message: "Discussion created successfully",
    data: discussion,
  });
});

const getAllDiscussions = catchAsync(async (req: Request, res: Response) => {
  const discussionsRes = await DiscussionServices.getAllDiscussions(req.query);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Discussions retrieved successfully",
    data: discussionsRes.result,
    meta: discussionsRes.meta,
  });
});

const getDiscussionBySlug = catchAsync(async (req: Request, res: Response) => {
  const discussion = await DiscussionServices.getDiscussionBySlug(
    String(req.params.slug)
  );
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Discussion retrieved successfully",
    data: discussion,
  });
});

const updateDiscussion = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?._id?.toString();
  const discussion = await DiscussionServices.updateDiscussion(
    String(req.params.slug),
    req.body,
    userId
  );
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Discussion updated successfully",
    data: discussion,
  });
});

const deleteDiscussion = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?._id?.toString();
  await DiscussionServices.deleteDiscussion(String(req.params.slug), userId);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Discussion deleted successfully",
    data: null,
  });
});

const addOpinion = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?._id?.toString();
  const { text, stance } = req.body;
  const discussion = await DiscussionServices.addOpinion(
    String(req.params.slug),
    text,
    stance,
    userId
  );
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Opinion added successfully",
    data: discussion,
  });
});

const getDiscussionsByTopic = catchAsync(
  async (req: Request, res: Response) => {
    const discussions = await DiscussionServices.getDiscussionsByTopic(
      String(req.params.topicId)
    );
    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: "Discussions retrieved successfully",
      data: discussions,
    });
  }
);

export const DiscussionController = {
  createDiscussion,
  getAllDiscussions,
  getDiscussionBySlug,
  updateDiscussion,
  deleteDiscussion,
  addOpinion,
  getDiscussionsByTopic,
};
