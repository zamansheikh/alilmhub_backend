import { z } from "zod";

const createArgument = z.object({
  body: z.object({
    argumentText: z
      .string()
      .min(1, "Argument text is required")
      .max(5000, "Argument cannot exceed 5000 characters")
      .trim(),
    type: z.enum(["supporting", "opposing"], {
      message: "Type must be 'supporting' or 'opposing'",
    }),
    references: z
      .array(z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid reference ID"))
      .optional(),
  }),
});

const updateArgument = z.object({
  body: z.object({
    argumentText: z
      .string()
      .min(1, "Argument text is required")
      .max(5000, "Argument cannot exceed 5000 characters")
      .trim()
      .optional(),
    references: z
      .array(z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid reference ID"))
      .optional(),
  }),
});

export const DebateArgumentValidation = { createArgument, updateArgument };
