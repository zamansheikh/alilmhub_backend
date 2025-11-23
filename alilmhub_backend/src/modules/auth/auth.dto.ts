import { z } from "zod";
import { LoginProvider } from "./auth.interface";

// Signup validation schema
const createUserDto = z.object({
  body: z
    .object({
      name: z.string().min(1, "Name is required").trim(),
      email: z.email("Invalid email format"),
      password: z.string().optional(),
      loginProvider: z.enum(LoginProvider),
    })
    .strict()
    .refine(
      (data) => {
        // If loginProvider is "email", password is required
        if (data.loginProvider === "email" && !data.password) {
          return false;
        }
        return true;
      },
      {
        message: "Password is required when using email login provider",
        path: ["password"],
      }
    ),
});

// Login validation schema
const loginUserDto = z.object({
  body: z
    .object({
      email: z.email("Invalid email format"),
      password: z.string().optional(),
      loginProvider: z.enum(LoginProvider),
      name: z.string().optional(),
    })
    .strict()
    .refine(
      (data) => {
        // If loginProvider is "email", password is required
        if (data.loginProvider === "email" && !data.password) {
          return false;
        }
        return true;
      },
      {
        message: "Password is required when using email login provider",
        path: ["password"],
      }
    ),
});

// Verify email validation schema
const verifyEmailDto = z.object({
  body: z
    .object({
      email: z
        .string()
        .min(1, "Email is required")
        .email("Invalid email format"),
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
    .strict(),
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
      email: z.email("Invalid email format"),
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
