import { Model, Types, Document } from "mongoose";

// ============================================================================
// CONTENT STRUCTURE TYPES (Block → Unit → Span)
// ============================================================================

/**
 * SPAN: Smallest unit of text with formatting
 */
export type TSpan = {
  text: string;
  type: "text" | "reference" | "debate";
  marks?: string[]; // ["bold", "italic", "highlight", etc.]
  data?: {
    refId?: string;
    debateId?: string;
    stance?: "supporting" | "opposing" | "neutral";
  };
};

/**
 * UNIT: A segment within a block (sentence or list item)
 */
export type TContentUnit = {
  id: string;
  content: string; // Plain text for search
  spans: TSpan[];
};

/**
 * BLOCK: Structural element (paragraph, heading, list, etc.)
 */
export type TContentBlock = {
  id: string;
  type: "heading" | "paragraph" | "list" | "quote" | "code";
  units: TContentUnit[];
  metadata?: {
    level?: number;
    ordered?: boolean;
    language?: string;
  };
};

/**
 * CHANGE: Tracks specific edits in a version
 */
export type TContentChange = {
  blockId: string;
  unitId: string;
  spanIndex: number;
  oldText: string;
  newText: string;
  diff: string;
};

/**
 * VERSION: Complete snapshot of content at a point in time
 */
export type TVersion = {
  versionId: string;
  changedAt: Date;
  changedBy: Types.ObjectId;
  changes?: TContentChange[];
  contentBlocks: TContentBlock[];
};

// ============================================================================
// LEGACY TYPES (Keeping for backward compatibility)
// ============================================================================

export type TBreadcrumb = {
  slug: string;
  title: string;
};

export type TTopicTreeNode = {
  slug: string;
  title: string;
  count: number;
  isFeatured?: boolean;
  hasSubTopics: boolean;
  children: TTopicTreeNode[];
};

// ============================================================================
// MAIN TOPIC TYPE
// ============================================================================

export type TTopic = {
  // Identification
  id: string; // Custom ID like "topic_salah"
  slug: string; // URL-friendly: "salah"
  title: string;
  
  // Hierarchy (Materialized Path Pattern)
  parentId?: string; // Parent topic ID
  level: number; // Depth in hierarchy
  path: string; // Full path: "/islam/fiqh/salah"
  
  // Content
  summary: string; // Brief description
  titleDescription?: string; // LEGACY: Keeping for backward compatibility
  wikiContent: string; // Markdown content
  
  // Versioned Content
  versions: TVersion[];
  contentBlocks: TContentBlock[];
  
  // Status
  status: "draft" | "published" | "archived";
  canonical: boolean;
  
  // Relationships (denormalized for performance)
  references: string[]; // Reference IDs
  debates: string[]; // Debate IDs
  discussions: string[];
  
  // Legacy fields (keeping for backward compatibility)
  parentTopic?: Types.ObjectId; // LEGACY
  
  // Metadata
  createdBy: Types.ObjectId;
  updatedBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  viewCount: number;
  editCount: number;
  editsCount: number; // LEGACY: Alias for editCount
  viewsCount: number; // LEGACY: Alias for viewCount
  
  isFeatured?: boolean;
  isDeleted?: boolean;
};

// ============================================================================
// DOCUMENT INTERFACE
// ============================================================================

export interface ITopicDocument extends Omit<TTopic, 'id'>, Document {
  // Hierarchy methods
  getBreadcrumb(): Promise<TBreadcrumb[]>;
  
  // Version methods
  getVersion(versionId: string): TVersion | null;
  createNewVersion(
    userId: Types.ObjectId,
    changes: TContentChange[],
    newContent: TContentBlock[]
  ): Promise<void>;
  
  // Content extraction methods
  extractReferences(blocks: TContentBlock[]): string[];
  extractDebates(blocks: TContentBlock[]): string[];
}

// ============================================================================
// MODEL INTERFACE
// ============================================================================

export type TopicModel = {
  isExistBySlug(slug: string): Promise<ITopicDocument | null>;
  isExistById(id: string): Promise<ITopicDocument | null>;
  getBreadcrumbPath(topicId: Types.ObjectId): Promise<TBreadcrumb[]>;
  getChildren(topicId: string): Promise<ITopicDocument[]>;
  getSubtree(path: string): Promise<ITopicDocument[]>;
} & Model<ITopicDocument>;
