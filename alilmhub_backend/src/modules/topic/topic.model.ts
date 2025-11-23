import { model, Schema, Types } from "mongoose";
import { ITopicDocument, TopicModel, TBreadcrumb } from "./topic.interface";

const topicSchema = new Schema<ITopicDocument>(
  {
    slug: {
      type: String,
      required: true,
      trim: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    titleDescription: {
      type: String,
      trim: true,
    },
    parentTopic: {
      type: Schema.Types.ObjectId,
      ref: "Topic",
    },
    editsCount: {
      type: Number,
      default: 0,
    },
    viewsCount: {
      type: Number,
      default: 0,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    references: [
      {
        type: Schema.Types.ObjectId,
        ref: "Reference",
      },
    ],
    isFeatured: {
      type: Boolean,
      default: false,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

topicSchema.index({ slug: 1 });
topicSchema.index({ title: 1 });
topicSchema.index({ parentTopic: 1 });
topicSchema.index({ isDeleted: 1 });
topicSchema.index({ createdAt: -1 });

topicSchema.pre("save", async function (next) {
  if (!this.slug) {
    const lastTopic = await Topic.findOne()
      .sort({ createdAt: -1 })
      .select("slug");
    
    let nextNumber = 1;
    if (lastTopic?.slug) {
      const match = lastTopic.slug.match(/TOP_(\d+)/);
      if (match) {
        nextNumber = parseInt(match[1], 10) + 1;
      }
    }
    
    this.slug = `TOP_${nextNumber}`;
  }
  next();
});

topicSchema.methods.getBreadcrumb = async function (): Promise<TBreadcrumb[]> {
  const breadcrumbs: TBreadcrumb[] = [];
  // eslint-disable-next-line @typescript-eslint/no-this-alias
  let currentTopic: any = this;

  while (currentTopic) {
    breadcrumbs.unshift({
      slug: currentTopic.slug,
      title: currentTopic.title,
    });

    if (currentTopic.parentTopic) {
      currentTopic = await Topic.findById(currentTopic.parentTopic);
    } else {
      currentTopic = null;
    }
  }

  return breadcrumbs;
};

topicSchema.statics.isExistBySlug = async function (slug: string) {
  return this.findOne({ slug });
};

topicSchema.statics.getBreadcrumbPath = async function (
  topicId: Types.ObjectId
): Promise<TBreadcrumb[]> {
  const topic = await this.findById(topicId);
  if (!topic) return [];
  return topic.getBreadcrumb();
};

export const Topic = model<ITopicDocument, TopicModel>(
  "Topic",
  topicSchema,
  "topics"
);
