import { StatusCodes } from "http-status-codes";
import { Types } from "mongoose";
import AppError from "../../errors/AppError";
import { Topic } from "./topic.model";
import { TTopic, TTopicTreeNode } from "./topic.interface";
import { QueryBuilder } from "../../shared/builder/QueryBuilder";

const createTopic = async (payload: Partial<TTopic>, userId?: string) => {
  if (!userId) {
    throw new AppError(StatusCodes.UNAUTHORIZED, "User ID is required");
  }
  
  // Sanitize payload: remove system-managed and immutable fields if provided
  const sanitizedPayload: any = { ...payload };
  delete sanitizedPayload._id;        // System-managed
  delete sanitizedPayload.createdAt;  // System-managed
  delete sanitizedPayload.updatedAt;  // System-managed
  delete sanitizedPayload.path;       // Calculated by middleware
  delete sanitizedPayload.level;      // Calculated by middleware
  
  // Validate parent exists if parentId is provided
  if (sanitizedPayload.parentId) {
    const parentTopic = await Topic.findOne({ 
      id: sanitizedPayload.parentId, 
      isDeleted: { $ne: true } 
    });
    
    if (!parentTopic) {
      throw new AppError(
        StatusCodes.BAD_REQUEST, 
        "Parent topic not found or has been deleted"
      );
    }
    
    // Remove legacy parentTopic field if provided - middleware will sync it
    delete sanitizedPayload.parentTopic;
  }
  
  const topicData = {
    ...sanitizedPayload,
    createdBy: new Types.ObjectId(userId),
  };
  const topic = await Topic.create(topicData);
  return topic;
};

const getAllTopics = async (query: Record<string, unknown>) => {
  const topicQuery = new QueryBuilder(
    Topic.find({ isDeleted: { $ne: true } }),
    query
  )
    .search(["title", "titleDescription", "summary", "wikiContent"])
    .filter()
    .sort()
    .paginate()
    .fields();

  const result = await topicQuery.modelQuery
    .populate("createdBy", "name email")
    .lean(); // Add lean() for better performance

  // Manually fetch parent topics for those that have parentId
  const parentIds = result
    .map((topic: any) => topic.parentId)
    .filter((id: any) => id);
  
  if (parentIds.length > 0) {
    const parents = await Topic.find({ id: { $in: parentIds } })
      .select("id slug title")
      .lean();
    
    // Map parent data to topics
    result.forEach((topic: any) => {
      if (topic.parentId) {
        topic.parent = parents.find((p: any) => p.id === topic.parentId);
      }
    });
  }

  const meta = await topicQuery.countTotal();

  return { result, meta };
};

const getTopicBySlug = async (slug: string) => {
  const topic = await Topic.findOne({ slug, isDeleted: { $ne: true } })
    .populate("createdBy", "name email profileImage");

  if (!topic) {
    throw new AppError(StatusCodes.NOT_FOUND, "Topic not found");
  }

  // Manually fetch parent topic if parentId exists
  let parent = null;
  if (topic.parentId) {
    parent = await Topic.findOne({ id: topic.parentId })
      .select("id slug title")
      .lean();
  }

  // Fire-and-forget view count increment (non-blocking)
  Topic.findOneAndUpdate({ slug }, { $inc: { viewCount: 1 } }).exec();

  const breadcrumb = await topic.getBreadcrumb();
  const breadcrumbPath = breadcrumb.map((b) => b.title).join(" -> ");

  return {
    ...topic.toObject(),
    parent,
    breadcrumb,
    breadcrumbPath,
  };
};

const updateTopic = async (
  slug: string,
  updateData: Partial<TTopic>,
  userId?: string
) => {
  if (!userId) {
    throw new AppError(StatusCodes.UNAUTHORIZED, "User ID is required");
  }
  
  const topic = await Topic.findOne({ slug, isDeleted: { $ne: true } })
    .populate("createdBy", "name email");
  
  if (!topic) {
    throw new AppError(StatusCodes.NOT_FOUND, "Topic not found");
  }

  // Sanitize updateData: prevent modification of immutable fields
  const sanitizedData: any = { ...updateData };
  delete sanitizedData.slug;      // Immutable
  delete sanitizedData.id;         // Immutable
  delete sanitizedData._id;        // System-managed
  delete sanitizedData.createdBy;  // Immutable
  delete sanitizedData.createdAt;  // System-managed

  // Use save() instead of findOneAndUpdate to ensure pre-save middleware runs
  // This is critical for path recalculation and validation
  Object.assign(topic, sanitizedData);
  topic.editCount += 1;
  topic.updatedBy = new Types.ObjectId(userId);
  
  await topic.save();
  
  // Re-populate after save
  await topic.populate("createdBy", "name email");
  
  // Manually fetch parent if parentId exists
  let parent = null;
  if (topic.parentId) {
    parent = await Topic.findOne({ id: topic.parentId })
      .select("id slug title")
      .lean();
  }

  const topicObj = topic.toObject();
  return { ...topicObj, parent };
};

const deleteTopic = async (slug: string, userId?: string) => {
  if (!userId) {
    throw new AppError(StatusCodes.UNAUTHORIZED, "User ID is required");
  }
  
  const topic = await Topic.findOne({ slug, isDeleted: { $ne: true } });
  if (!topic) {
    throw new AppError(StatusCodes.NOT_FOUND, "Topic not found");
  }

  const deletedTopic = await Topic.findOneAndUpdate(
    { slug },
    { isDeleted: true },
    { new: true }
  );

  return deletedTopic;
};

const addReferences = async (slug: string, referenceIds: string[]) => {
  const topic = await Topic.findOne({ slug, isDeleted: { $ne: true } });
  if (!topic) {
    throw new AppError(StatusCodes.NOT_FOUND, "Topic not found");
  }

  // References are now stored as string IDs, not ObjectIds
  const updatedTopic = await Topic.findOneAndUpdate(
    { slug },
    { $addToSet: { references: { $each: referenceIds } } },
    { new: true }
  );

  return updatedTopic;
};

const removeReferences = async (slug: string, referenceIds: string[]) => {
  const topic = await Topic.findOne({ slug, isDeleted: { $ne: true } });
  if (!topic) {
    throw new AppError(StatusCodes.NOT_FOUND, "Topic not found");
  }

  // References are now stored as string IDs, not ObjectIds
  const updatedTopic = await Topic.findOneAndUpdate(
    { slug },
    { $pull: { references: { $in: referenceIds } } },
    { new: true }
  );

  return updatedTopic;
};

const getSubTopics = async (parentSlug: string) => {
  const parentTopic = await Topic.findOne({
    slug: parentSlug,
    isDeleted: { $ne: true },
  });
  if (!parentTopic) {
    throw new AppError(StatusCodes.NOT_FOUND, "Parent topic not found");
  }

  // Use new parentId field for consistency
  const subTopics = await Topic.find({
    parentId: parentTopic.id,
    isDeleted: { $ne: true },
  })
    .populate("createdBy", "name email")
    .sort({ createdAt: -1 });

  return subTopics;
};

const getKnowledgeTree = async () => {
  const allTopics = await Topic.find({ isDeleted: { $ne: true } }).lean();

  const topicMap = new Map<string, TTopicTreeNode>();
  const rootTopics: TTopicTreeNode[] = [];

  // Use new parentId field for consistency and efficiency
  allTopics.forEach((topic) => {
    const childrenCount = allTopics.filter(
      (t) => t.parentId === topic.id
    ).length;

    topicMap.set(topic.id, {
      slug: topic.slug,
      title: topic.title,
      count: topic.references?.length || 0,
      isFeatured: topic.isFeatured || false,
      hasSubTopics: childrenCount > 0,
      children: [],
    });
  });

  allTopics.forEach((topic) => {
    const node = topicMap.get(topic.id);
    if (!node) return;

    if (topic.parentId) {
      const parentNode = topicMap.get(topic.parentId);
      if (parentNode) {
        parentNode.children.push(node);
      }
    } else {
      rootTopics.push(node);
    }
  });

  return rootTopics;
};

// ============================================================================
// NEW SERVICES FOR VERSIONING
// ============================================================================

const getTopicVersions = async (slug: string) => {
  const topic = await Topic.findOne({ slug, isDeleted: { $ne: true } });
  if (!topic) {
    throw new AppError(StatusCodes.NOT_FOUND, "Topic not found");
  }
  return topic.versions;
};

const getTopicVersion = async (slug: string, versionId: string) => {
  const topic = await Topic.findOne({ slug, isDeleted: { $ne: true } });
  if (!topic) {
    throw new AppError(StatusCodes.NOT_FOUND, "Topic not found");
  }
  
  const version = topic.getVersion(versionId);
  if (!version) {
    throw new AppError(StatusCodes.NOT_FOUND, "Version not found");
  }
  
  return version;
};

const updateTopicContent = async (
  slug: string,
  newContent: any,
  userId: string
) => {
  const topic = await Topic.findOne({ slug, isDeleted: { $ne: true } });
  if (!topic) {
    throw new AppError(StatusCodes.NOT_FOUND, "Topic not found");
  }

  // Calculate actual changes
  const changes = calculateContentChanges(
    topic.contentBlocks,
    newContent.contentBlocks
  );

  // Create version with changes
  await topic.createNewVersion(
    new Types.ObjectId(userId),
    changes,
    newContent.contentBlocks
  );

  return topic;
};

// Helper function to calculate changes between old and new content
const calculateContentChanges = (
  oldBlocks: any[],
  newBlocks: any[]
): any[] => {
  const changes: any[] = [];

  // Create maps for quick lookup
  const oldBlockMap = new Map(oldBlocks.map((b) => [b.id, b]));
  const newBlockMap = new Map(newBlocks.map((b) => [b.id, b]));

  // Check for modified blocks
  newBlocks.forEach((newBlock) => {
    const oldBlock = oldBlockMap.get(newBlock.id);
    if (oldBlock) {
      // Compare units within the block
      newBlock.units.forEach((newUnit: any, unitIndex: number) => {
        const oldUnit = oldBlock.units[unitIndex];
        if (oldUnit) {
          // Compare spans within the unit
          newUnit.spans.forEach((newSpan: any, spanIndex: number) => {
            const oldSpan = oldUnit.spans[spanIndex];
            if (oldSpan && oldSpan.text !== newSpan.text) {
              changes.push({
                blockId: newBlock.id,
                unitId: newUnit.id,
                spanIndex: spanIndex,
                oldText: oldSpan.text,
                newText: newSpan.text,
                diff: `${oldSpan.text} → ${newSpan.text}`,
              });
            }
          });
        }
      });
    }
  });

  return changes;
};

// ============================================================================
// NEW SERVICES FOR HIERARCHY
// ============================================================================

const getTopicChildren = async (slug: string) => {
  const topic = await Topic.findOne({ slug, isDeleted: { $ne: true } });
  if (!topic) {
    throw new AppError(StatusCodes.NOT_FOUND, "Topic not found");
  }

  const children = await Topic.getChildren(topic.id);
  return children;
};

const getTopicSubtree = async (slug: string) => {
  const topic = await Topic.findOne({ slug, isDeleted: { $ne: true } });
  if (!topic) {
    throw new AppError(StatusCodes.NOT_FOUND, "Topic not found");
  }

  const subtree = await Topic.getSubtree(topic.path);
  return subtree;
};

const getTopicsByPath = async (path: string) => {
  const topics = await Topic.find({ 
    path: new RegExp(`^${path.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`),
    isDeleted: { $ne: true }
  }).sort({ level: 1, title: 1 });
  
  return topics;
};

// ============================================================================
// EXPORTS
// ============================================================================

export const TopicServices = {
  // Legacy services (backward compatible)
  createTopic,
  getAllTopics,
  getTopicBySlug,
  updateTopic,
  deleteTopic,
  addReferences,
  removeReferences,
  getSubTopics,
  getKnowledgeTree,
  
  // New versioning services
  getTopicVersions,
  getTopicVersion,
  updateTopicContent,
  
  // New hierarchy services
  getTopicChildren,
  getTopicSubtree,
  getTopicsByPath,
};
