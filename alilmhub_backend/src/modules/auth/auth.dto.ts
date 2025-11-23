import { z } from "zod";
import { LoginProvider } from "./auth.interface";





// Signup validation schema
const createUserDto = z.object({
  body: z
    .object({
      firstName: z.string().min(1, "First name is required"),
      lastName: z.string().min(1, "Last name is required"),
      email: z.email("Invalid email format"),
      password: z.string().optional(),
      loginProvider: z.enum(LoginProvider),
    })
    .strict(),
});

// Login validation schema
const loginUserDto = z.object({
  body: z
    .object({
      email: z.email("Invalid email format"),
      password: z.string().optional(),
      loginProvider: z.enum(LoginProvider),
      firstName: z.string().optional(),
      lastName: z.string().optional(),
    })
    .strict(),
});

// Verify email validation schema
const verifyEmailDto = z.object({
  body: z
    .object({
      email: z.string().min(1, "Email is required").email("Invalid email format"),
      oneTimeCode: z.string().min(1, "OTP is required"),
      reason: z.enum(["account_verification", "password_reset"]).optional(),
    })
    .strict(),
});

// Forget password validation schema
const forgetPasswordDto = z.object({
  body: z
    .object({
      email: z.email("Invalid email format"),
    })
    .strict(),
});

// Reset password validation schema
const resetPasswordDto = z.object({
  body: z
    .object({
      newPassword: z.string().min(6, "Password must be at least 6 characters"),
    })
    .strict()
    
});

// Change password validation schema
const changePasswordDto = z.object({
  body: z
    .object({
      currentPassword: z.string().min(1, "Current password is required"),
      newPassword: z.string().min(6, "Password must be at least 6 characters"),
    })
    .strict(),
});

// Resend OTP validation schema
const resendOtpDto = z.object({
  body: z
    .object({
      email: z.string().min(1, "Email is required").email("Invalid email format"),
      reason: z.enum(["account_verification", "password_reset"]),
    })
    .strict(),
});

export const AuthValidation = {
  createUserDto,
  loginUserDto,
  verifyEmailDto,
  forgetPasswordDto,
  resetPasswordDto,
  changePasswordDto,
  resendOtpDto,
};
