import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { ReferenceServices } from "./references.service";
import catchAsync from "../../shared/util/catchAsync";
import sendResponse from "../../shared/util/sendResponse";

const createReference = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const reference = await ReferenceServices.createReference(req.body, userId);
  sendResponse(res, {
    statusCode: StatusCodes.CREATED,
    success: true,
    message: "Reference created successfully",
    data: reference,
  });
});

const getAllReferences = catchAsync(async (req: Request, res: Response) => {
  const referencesRes = await ReferenceServices.getAllReferences(req.query);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "References retrieved successfully",
    data: referencesRes.result,
    meta: referencesRes.meta,
  });
});

const getReferenceBySlug = catchAsync(async (req: Request, res: Response) => {
  const reference = await ReferenceServices.getReferenceBySlug(req?.params?.slug);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Reference retrieved successfully",
    data: reference,
  });
});

const updateReference = catchAsync(async (req: Request, res: Response) => {
  const reference = await ReferenceServices.updateReference(
    req.params.slug,
    req.body
  );
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Reference updated successfully",
    data: reference,
  });
});

const deleteReference = catchAsync(async (req: Request, res: Response) => {
  await ReferenceServices.deleteReference(req.params.slug);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Reference deleted successfully",
    data: null,
  });
});

const verifyReference = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const reference = await ReferenceServices.verifyReference(
    req.params.slug,
    userId
  );
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Reference verified successfully",
    data: reference,
  });
});

const getBulkReferences = catchAsync(async (req: Request, res: Response) => {
  const { ids } = req.body;
  const references = await ReferenceServices.getBulkReferences(ids);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "References retrieved successfully",
    data: references,
  });
});

export const ReferenceController = {
  createReference,
  getAllReferences,
  getReferenceBySlug,
  updateReference,
  deleteReference,
  verifyReference,
  getBulkReferences,
};
