import express, { Router } from "express";
import { UserController } from "./user.controller";
import { UserValidation } from "./user.dto";
import fileUploadHandler from "../../shared/middlewares/fileUploadHandler";
import auth from "../../shared/middlewares/auth";
import validateRequest from "../../shared/middlewares/validateRequest";

const router = express.Router();

/**
 * @route   GET /api/v1/user/get-all-users
 * @desc    Get all users
 * @access  Private (Super Admin only)
 */
router.get("/get-all-users", auth("super_admin"), UserController.getAllUsers);

/**
 * @route   GET /api/v1/user/me
 * @desc    Get current authenticated user
 * @access  Private
 */
router.get("/me", auth(),UserController.getMe);

/**
 * @route   GET /api/v1/user/:id
 * @desc    Get user by ID
 * @access  Public
 */
router.get("/:id", UserController.getUserById);

/**
 * @route   PATCH /api/v1/user/:id
 * @desc    Update user profile
 * @access  Private
 */
router.patch(
  "/:id",
  auth(),
  fileUploadHandler,
  validateRequest(UserValidation.updateUser),
  UserController.updateUser
);

/**
 * @route   PATCH /api/v1/user/:id/status
 * @desc    Update user activation status
 * @access  Private (Admin)
 */
router.patch(
  "/:id/status",
  auth(),
  validateRequest(UserValidation.updateUserActivationStatus),
  UserController.updateUserActivationStatus
);

/**
 * @route   PATCH /api/v1/user/:id/role
 * @desc    Update user role
 * @access  Private (Super Admin only)
 */
router.patch(
  "/:id/role",
  auth("super_admin"),
  validateRequest(UserValidation.updateUserRole),
  UserController.updateUserRole
);

export const UserRoutes: Router = router;
