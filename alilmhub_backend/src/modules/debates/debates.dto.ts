import { z } from "zod";

const createDebate = z.object({
  body: z.object({
    title: z
      .string()
      .min(1, "Title is required")
      .max(500, "Title cannot exceed 500 characters")
      .trim(),
    titleDescription: z
      .string()
      .max(2000, "Title description cannot exceed 2000 characters")
      .trim()
      .optional(),
    topicId: z
      .string()
      .regex(/^[0-9a-fA-F]{24}$/, "Invalid topic ID format")
      .optional(),
    description: z
      .string()
      .min(1, "Description is required")
      .max(5000, "Description cannot exceed 5000 characters")
      .trim(),
    stance: z.enum(["supporting", "opposing"], {
      message: "Stance must be either 'supporting' or 'opposing'",
    }),
    references: z
      .array(
        z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid reference ID format")
      )
      .optional(),
  }),
});

const updateDebate = z.object({
  body: z.object({
    title: z
      .string()
      .min(1, "Title is required")
      .max(500, "Title cannot exceed 500 characters")
      .trim()
      .optional(),
    titleDescription: z
      .string()
      .max(2000, "Title description cannot exceed 2000 characters")
      .trim()
      .optional(),
    topicId: z
      .string()
      .regex(/^[0-9a-fA-F]{24}$/, "Invalid topic ID format")
      .optional(),
    description: z
      .string()
      .min(1, "Description is required")
      .max(5000, "Description cannot exceed 5000 characters")
      .trim()
      .optional(),
    stance: z.enum(["supporting", "opposing"]).optional(),
    status: z.enum(["open", "closed", "archived"]).optional(),
    references: z
      .array(
        z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid reference ID format")
      )
      .optional(),
  }),
});

const addReferences = z.object({
  body: z.object({
    referenceIds: z
      .array(
        z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid reference ID format")
      )
      .min(1, "At least one reference ID is required"),
  }),
});

const removeReferences = z.object({
  body: z.object({
    referenceIds: z
      .array(
        z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid reference ID format")
      )
      .min(1, "At least one reference ID is required"),
  }),
});

const joinDebate = z.object({
  body: z.object({
    side: z.enum(["supporting", "opposing"], {
      message: "Side must be either 'supporting' or 'opposing'",
    }),
  }),
});

const updateStatus = z.object({
  body: z.object({
    status: z.enum(["open", "closed", "archived"], {
      message: "Status must be 'open', 'closed', or 'archived'",
    }),
  }),
});

export const DebateValidation = {
  createDebate,
  updateDebate,
  addReferences,
  removeReferences,
  joinDebate,
  updateStatus,
};
