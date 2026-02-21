import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { TopicServices } from "./topic.service";
import catchAsync from "../../shared/util/catchAsync";
import sendResponse from "../../shared/util/sendResponse";

const createTopic = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?._id?.toString();
  const topic = await TopicServices.createTopic(req.body, userId);
  sendResponse(res, {
    statusCode: StatusCodes.CREATED,
    success: true,
    message: "Topic created successfully",
    data: topic,
  });
});

const getAllTopics = catchAsync(async (req: Request, res: Response) => {
  const topicsRes = await TopicServices.getAllTopics(req.query);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Topics retrieved successfully",
    data: topicsRes.result,
    meta: topicsRes.meta,
  });
});

const getTopicBySlug = catchAsync(async (req: Request, res: Response) => {
  const topic = await TopicServices.getTopicBySlug(req.params.slug as string);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Topic retrieved successfully",
    data: topic,
  });
});

const updateTopic = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?._id?.toString();
  const topic = await TopicServices.updateTopic(
    req.params.slug as string,
    req.body,
    userId
  );
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Topic updated successfully",
    data: topic,
  });
});

const deleteTopic = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?._id?.toString();
  await TopicServices.deleteTopic(req.params.slug as string, userId);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Topic deleted successfully",
    data: null,
  });
});

const addReferences = catchAsync(async (req: Request, res: Response) => {
  const { referenceIds } = req.body;
  const topic = await TopicServices.addReferences(req.params.slug as string, referenceIds);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "References added successfully",
    data: topic,
  });
});

const removeReferences = catchAsync(async (req: Request, res: Response) => {
  const { referenceIds } = req.body;
  const topic = await TopicServices.removeReferences(
    req.params.slug as string,
    referenceIds
  );
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "References removed successfully",
    data: topic,
  });
});

const getSubTopics = catchAsync(async (req: Request, res: Response) => {
  const subTopics = await TopicServices.getSubTopics(req.params.slug as string);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Sub-topics retrieved successfully",
    data: subTopics,
  });
});

const getKnowledgeTree = catchAsync(async (req: Request, res: Response) => {
  const tree = await TopicServices.getKnowledgeTree();
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Knowledge tree retrieved successfully",
    data: tree,
  });
});

// ============================================================================
// NEW CONTROLLERS FOR VERSIONING
// ============================================================================

const getTopicVersions = catchAsync(async (req: Request, res: Response) => {
  const versions = await TopicServices.getTopicVersions(req.params.slug as string);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Topic versions retrieved successfully",
    data: versions,
  });
});

const getTopicVersion = catchAsync(async (req: Request, res: Response) => {
  const version = await TopicServices.getTopicVersion(
    req.params.slug as string,
    req.params.versionId as string
  );
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Topic version retrieved successfully",
    data: version,
  });
});

const updateTopicContent = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?._id?.toString();
  const topic = await TopicServices.updateTopicContent(
    req.params.slug as string,
    req.body,
    userId
  );
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Topic content updated successfully",
    data: topic,
  });
});

const reviewTopicVersion = catchAsync(async (req: Request, res: Response) => {
  const reviewerId = req.user?._id?.toString();
  const result = await TopicServices.reviewTopicVersion(
    req.params.slug as string,
    req.params.versionId as string,
    reviewerId,
    req.body
  );
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: `Version ${req.body.action}d successfully`,
    data: result,
  });
});

// ============================================================================
// NEW CONTROLLERS FOR HIERARCHY
// ============================================================================

const getTopicChildren = catchAsync(async (req: Request, res: Response) => {
  const children = await TopicServices.getTopicChildren(req.params.slug as string);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Topic children retrieved successfully",
    data: children,
  });
});

const getTopicSubtree = catchAsync(async (req: Request, res: Response) => {
  const subtree = await TopicServices.getTopicSubtree(req.params.slug as string);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Topic subtree retrieved successfully",
    data: subtree,
  });
});

const getTopicsByPath = catchAsync(async (req: Request, res: Response) => {
  const topics = await TopicServices.getTopicsByPath(req.query.path as string);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Topics by path retrieved successfully",
    data: topics,
  });
});

// ============================================================================
// EXPORTS
// ============================================================================

export const TopicController = {
  // Legacy controllers
  createTopic,
  getAllTopics,
  getTopicBySlug,
  updateTopic,
  deleteTopic,
  addReferences,
  removeReferences,
  getSubTopics,
  getKnowledgeTree,
  
  // New versioning controllers
  getTopicVersions,
  getTopicVersion,
  updateTopicContent,
  reviewTopicVersion,

  // New hierarchy controllers
  getTopicChildren,
  getTopicSubtree,
  getTopicsByPath,
};
