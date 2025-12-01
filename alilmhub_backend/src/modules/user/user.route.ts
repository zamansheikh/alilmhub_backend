import express, { Router } from "express";
import { UserController } from "./user.controller";
import { UserValidation } from "./user.dto";
import fileUploadHandler from "../../shared/middlewares/fileUploadHandler";
import auth from "../../shared/middlewares/auth";
import validateRequest from "../../shared/middlewares/validateRequest";

const router = express.Router();

/**
 * @route   GET /api/v1/users/get-all-users
 * @desc    Get all users
 * @access  Public
 */
router.get("/get-all-users", UserController.getAllUsers);

/**
 * @route   GET /api/v1/users/me
 * @desc    Get current authenticated user
 * @access  Private
 */
router.get("/me", auth(),UserController.getMe);

/**
 * @route   GET /api/v1/users/:id
 * @desc    Get user by ID
 * @access  Public
 */
router.get("/:id", UserController.getUserById);

/**
 * @route   PATCH /api/v1/users/:id
 * @desc    Update user profile
 * @access  Private
 */
router.patch(
  "/:id", 
  fileUploadHandler,
  validateRequest(UserValidation.updateUser),
  UserController.updateUser
);

/**
 * @route   PATCH /api/v1/users/:id/status
 * @desc    Update user activation status
 * @access  Private (Admin)
 */
router.patch(
  "/:id/status",
  validateRequest(UserValidation.updateUserActivationStatus),
  UserController.updateUserActivationStatus
);

/**
 * @route   PATCH /api/v1/users/:id/role
 * @desc    Update user role
 * @access  Private (Admin)
 */
router.patch(
  "/:id/role",
  validateRequest(UserValidation.updateUserRole),
  UserController.updateUserRole
);

export const UserRoutes: Router = router;
