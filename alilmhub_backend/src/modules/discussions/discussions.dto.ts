import { z } from "zod";

const createDiscussion = z.object({
  body: z.object({
    title: z
      .string()
      .min(1, "Title is required")
      .max(500, "Title cannot exceed 500 characters")
      .trim(),
    description: z
      .string()
      .max(3000, "Description cannot exceed 3000 characters")
      .trim()
      .optional(),
    topicId: z
      .string()
      .regex(/^[0-9a-fA-F]{24}$/, "Invalid topic ID format")
      .optional(),
  }),
});

const updateDiscussion = z.object({
  body: z.object({
    title: z
      .string()
      .min(1, "Title is required")
      .max(500, "Title cannot exceed 500 characters")
      .trim()
      .optional(),
    description: z
      .string()
      .max(3000, "Description cannot exceed 3000 characters")
      .trim()
      .optional(),
    status: z
      .enum(["open", "closed"], {
        message: "Status must be 'open' or 'closed'",
      })
      .optional(),
    topicId: z
      .string()
      .regex(/^[0-9a-fA-F]{24}$/, "Invalid topic ID format")
      .optional(),
  }),
});

const addOpinion = z.object({
  body: z.object({
    text: z
      .string()
      .min(1, "Opinion text is required")
      .max(3000, "Opinion cannot exceed 3000 characters")
      .trim(),
    stance: z.enum(["supporting", "opposing"], {
      message: "Stance must be 'supporting' or 'opposing'",
    }),
  }),
});

export const DiscussionValidation = {
  createDiscussion,
  updateDiscussion,
  addOpinion,
};
