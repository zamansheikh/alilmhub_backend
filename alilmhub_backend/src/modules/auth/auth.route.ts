import express, { Router } from "express";
import { AuthController } from "./auth.controller";
import { AuthValidation } from "./auth.dto";
import validateRequest from "../../shared/middlewares/validateRequest";
import auth from "../../shared/middlewares/auth";

const router = express.Router();

/**
 * @route   POST /api/v1/auth/signup
 * @desc    Register a new user
 * @access  Public
 */
router.post(
  "/signup",
  validateRequest(AuthValidation.createUserDto),
  AuthController.createUser
);

/**
 * @route   POST /api/v1/auth/login
 * @desc    Authenticate user and get token
 * @access  Public
 */
router.post(
  "/login",
  validateRequest(AuthValidation.loginUserDto),
  AuthController.loginUser
);

/**
 * @route   POST /api/v1/auth/verify-email
 * @desc    Verify user email with OTP
 * @access  Public
 */
router.post(
  "/verify-email",
  validateRequest(AuthValidation.verifyEmailDto),
  AuthController.verifyEmail
);

/**
 * @route   POST /api/v1/auth/forgot-password
 * @desc    Send password reset email
 * @access  Public
 */
router.post(
  "/forgot-password",
  validateRequest(AuthValidation.forgetPasswordDto),
  AuthController.forgetPassword
);

/**
 * @route   POST /api/v1/auth/reset-password
 * @desc    Reset user password with token
 * @access  Public
 */
router.post(
  "/reset-password",
  validateRequest(AuthValidation.resetPasswordDto),
  AuthController.resetPassword
);

/**
 * @route   POST /api/v1/auth/change-password
 * @desc    Change user password
 * @access  Private
 */
router.post(
  "/change-password",
  auth(),
  validateRequest(AuthValidation.changePasswordDto),
  AuthController.changePassword
);

/**
 * @route   POST /api/v1/auth/resend-otp
 * @desc    Resend OTP for email verification
 * @access  Public
 */
router.post(
  "/resend-otp",
  validateRequest(AuthValidation.resendOtpDto),
  AuthController.resendOtp
);

/**
 * @route   DELETE /api/v1/auth/delete-account
 * @desc    Delete user account
 * @access  Private
 */
router.delete(
  "/delete-account",
  auth(),
  AuthController.deleteAccount
);

export const AuthRoutes: Router = router;
