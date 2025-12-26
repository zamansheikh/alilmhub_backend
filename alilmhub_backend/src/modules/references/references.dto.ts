import { z } from "zod";

const createReference = z.object({
  body: z.object({
    type: z.enum(["book", "article", "hadith", "quran"]),
    title: z
      .string()
      .min(1, "Title is required")
      .max(500, "Title cannot exceed 500 characters")
      .trim(),
    author: z.string().max(200, "Author name cannot exceed 200 characters").trim().optional(),
    citationText: z.string().trim().optional(),
    sourceUrl: z.url("Invalid URL format").trim().optional(),
    sourceLanguage: z.string().max(50).trim().optional(),
  }),
});

const updateReference = z.object({
  body: z.object({
    type: z.enum(["book", "article", "hadith", "quran"]).optional(),
    title: z
      .string()
      .min(1, "Title is required")
      .max(500, "Title cannot exceed 500 characters")
      .trim()
      .optional(),
    author: z.string().max(200, "Author name cannot exceed 200 characters").trim().optional(),
    citationText: z.string().trim().optional(),
    sourceUrl: z.url("Invalid URL format").trim().optional(),
    sourceLanguage: z.string().max(50).trim().optional(),
    verified: z.boolean().optional(),
  }),
});

const getBulkReferences = z.object({
  body: z.object({
    ids: z.array(z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid ID format")).min(1, "At least one ID is required"),
  }),
});

export const ReferenceValidation = {
  createReference,
  updateReference,
  getBulkReferences,
};
