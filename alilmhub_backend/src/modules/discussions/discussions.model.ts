import { model, Schema } from "mongoose";
import { DiscussionModel, IDiscussionDocument } from "./discussions.interface";

const opinionSchema = new Schema(
  {
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    text: {
      type: String,
      required: true,
      trim: true,
      maxlength: 3000,
    },
    stance: {
      type: String,
      enum: ["supporting", "opposing"],
      required: true,
    },
  },
  { timestamps: true, _id: true }
);

const discussionSchema = new Schema<IDiscussionDocument>(
  {
    slug: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    topicId: {
      type: Schema.Types.ObjectId,
      ref: "Topic",
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    opinions: {
      type: [opinionSchema],
      default: [],
    },
    supportingCount: {
      type: Number,
      default: 0,
    },
    opposingCount: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ["open", "closed"],
      default: "open",
    },
    viewsCount: {
      type: Number,
      default: 0,
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

discussionSchema.index({ slug: 1, isDeleted: 1 });
discussionSchema.index({ title: 1 });
discussionSchema.index({ topicId: 1 });
discussionSchema.index({ author: 1 });
discussionSchema.index({ status: 1 });
discussionSchema.index({ createdAt: -1 });

discussionSchema.pre("validate", async function (next) {
  if (!this.isNew && this.isModified("slug")) {
    throw new Error("Slug cannot be modified after creation.");
  }

  if (!this.slug && this.isNew) {
    let baseSlug = this.title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "")
      .substring(0, 60);

    this.slug = baseSlug;
    let counter = 1;
    const maxRetries = 100;

    while (counter < maxRetries) {
      const exists = await Discussion.findOne({ slug: this.slug })
        .select("_id")
        .lean();
      if (!exists) break;
      this.slug = `${baseSlug}-${counter}`;
      counter++;
    }

    if (counter >= maxRetries) {
      this.slug = `${baseSlug}-${Date.now()}`;
    }
  }
  next();
});

discussionSchema.statics.isExistBySlug = async function (slug: string) {
  return this.findOne({ slug, isDeleted: { $ne: true } });
};

export const Discussion = model<IDiscussionDocument, DiscussionModel>(
  "Discussion",
  discussionSchema,
  "discussions"
);
