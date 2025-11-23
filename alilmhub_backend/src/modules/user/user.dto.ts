import { z } from "zod";

const createUser = z.object({
  body: z
    .object({
      name: z
        .string()
        .min(1, "Name is required")
        .max(100, "Name is too long")
        .trim(),
      email: z.email("Invalid email address").trim().toLowerCase(),
      password: z
        .string()
        .min(6, "Password must be at least 6 characters long")
        .max(100, "Password is too long")
        .trim(),
    })
    .strict(),
});

const updateUser = z.object({
  data: z
    .object({
      name: z
        .string()
        .min(1, "Name is required")
        .max(100, "Name is too long")
        .trim(),
      email: z.email("Invalid email address").trim().toLowerCase(),
      password: z
        .string()
        .min(6, "Password must be at least 6 characters long")
        .max(100, "Password is too long")
        .trim(),
      phoneNumber: z
        .string()
        .regex(/^\+?[1-9]\d{1,14}$/, "Please provide a valid phone number")
        .trim()
        .optional(),
      image: z.string().nullable().optional(),
    })
    .strict(),
});

const updateUserActivationStatus = z.object({
  body: z
    .object({
      status: z.enum(["active", "delete"]),
    })
    .strict(),
});

const updateUserRole = z.object({
  body: z
    .object({
      role: z.enum(["contributor", "reviewer", "scholar", "super_admin"]),
    })
    .strict(),
});

export const UserValidation = {
  createUser,
  updateUser,
  updateUserActivationStatus,
  updateUserRole,
};
