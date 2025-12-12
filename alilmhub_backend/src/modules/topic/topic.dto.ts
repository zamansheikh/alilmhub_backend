import { z } from "zod";

// ============================================================================
// CONTENT STRUCTURE VALIDATORS
// ============================================================================

const spanValidator = z.object({
  text: z.string(),
  type: z.enum(["text", "reference", "debate"]),
  marks: z.array(z.string()).optional(),
  data: z.object({
    refId: z.string().optional(),
    debateId: z.string().optional(),
    stance: z.enum(["supporting", "opposing", "neutral"]).optional(),
  }).optional(),
});

const contentUnitValidator = z.object({
  id: z.string(),
  content: z.string(),
  spans: z.array(spanValidator),
});

const contentBlockValidator = z.object({
  id: z.string(),
  type: z.enum(["heading", "paragraph", "list", "quote", "code"]),
  units: z.array(contentUnitValidator),
  metadata: z.object({
    level: z.number().optional(),
    ordered: z.boolean().optional(),
    language: z.string().optional(),
  }).optional(),
});

// ============================================================================
// LEGACY VALIDATORS (BACKWARD COMPATIBLE)
// ============================================================================

const createTopic = z.object({
  body: z.object({
    title: z
      .string()
      .min(1, "Title is required")
      .max(500, "Title cannot exceed 500 characters")
      .trim(),
    titleDescription: z
      .string()
      .max(2000, "Description cannot exceed 2000 characters")
      .trim()
      .optional(),
    summary: z
      .string()
      .max(500, "Summary cannot exceed 500 characters")
      .trim()
      .optional(),
    wikiContent: z
      .string()
      .max(50000, "Content cannot exceed 50000 characters")
      .optional(),
    // DEPRECATED: Use parentId instead
    parentTopic: z
      .string()
      .regex(/^[0-9a-fA-F]{24}$/, "Invalid parent topic ID format")
      .optional(),
    // NEW: Use string-based parentId
    parentId: z
      .string()
      .min(1, "Parent ID cannot be empty")
      .optional(),
    references: z
      .array(z.string().min(1, "Reference ID cannot be empty"))
      .optional(),
    isFeatured: z.boolean().optional(),
    status: z.enum(["draft", "published", "archived"]).optional(),
  }),
});

const updateTopic = z.object({
  body: z.object({
    title: z
      .string()
      .min(1, "Title is required")
      .max(500, "Title cannot exceed 500 characters")
      .trim()
      .optional(),
    titleDescription: z
      .string()
      .max(2000, "Description cannot exceed 2000 characters")
      .trim()
      .optional(),
    summary: z
      .string()
      .max(500, "Summary cannot exceed 500 characters")
      .trim()
      .optional(),
    wikiContent: z
      .string()
      .max(50000, "Content cannot exceed 50000 characters")
      .optional(),
    // DEPRECATED: Use parentId instead
    parentTopic: z
      .string()
      .regex(/^[0-9a-fA-F]{24}$/, "Invalid parent topic ID format")
      .optional(),
    // NEW: Use string-based parentId
    parentId: z
      .string()
      .min(1, "Parent ID cannot be empty")
      .optional(),
    references: z
      .array(z.string().min(1, "Reference ID cannot be empty"))
      .optional(),
    isFeatured: z.boolean().optional(),
    status: z.enum(["draft", "published", "archived"]).optional(),
  }),
});

const addReferences = z.object({
  body: z.object({
    referenceIds: z
      .array(z.string().min(1, "Reference ID cannot be empty"))
      .min(1, "At least one reference ID is required"),
  }),
});

const removeReferences = z.object({
  body: z.object({
    referenceIds: z
      .array(z.string().min(1, "Reference ID cannot be empty"))
      .min(1, "At least one reference ID is required"),
  }),
});

// ============================================================================
// NEW VALIDATORS FOR VERSIONED CONTENT
// ============================================================================

const updateTopicContent = z.object({
  body: z.object({
    contentBlocks: z.array(contentBlockValidator),
    summary: z.string().optional(),
    wikiContent: z.string().optional(),
  }),
});

const getVersion = z.object({
  params: z.object({
    slug: z.string(),
    versionId: z.string(),
  }),
});

// ============================================================================
// EXPORTS
// ============================================================================

export const TopicValidation = {
  // Legacy validators
  createTopic,
  updateTopic,
  addReferences,
  removeReferences,
  
  // New validators
  updateTopicContent,
  getVersion,
};
