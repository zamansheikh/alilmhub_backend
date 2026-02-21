import { model, Schema } from "mongoose";
import { DebateModel, IDebateDocument } from "./debates.interface";

const debateSchema = new Schema<IDebateDocument>(
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
    titleDescription: {
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
    supportingMembers: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    opposingMembers: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    description: {
      type: String,
      required: true,
      trim: true,
    },
    references: [
      {
        type: Schema.Types.ObjectId,
        ref: "Reference",
      },
    ],
    status: {
      type: String,
      enum: ["open", "closed", "archived"],
      default: "open",
    },
    stance: {
      type: String,
      enum: ["supporting", "opposing", "neutral"],
      required: true,
    },
    viewsCount: {
      type: Number,
      default: 0,
    },
    supportingVotesCount: {
      type: Number,
      default: 0,
    },
    opposingVotesCount: {
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

debateSchema.index({ slug: 1, isDeleted: 1 });
debateSchema.index({ title: 1 });
debateSchema.index({ topicId: 1 });
debateSchema.index({ author: 1 });
debateSchema.index({ status: 1 });
debateSchema.index({ isDeleted: 1 });
debateSchema.index({ createdAt: -1 });

debateSchema.pre("validate", async function (next) {
  // Prevent slug modification on existing documents
  if (!this.isNew && this.isModified("slug")) {
    throw new Error("Slug cannot be modified after creation.");
  }

  if (!this.slug && this.isNew) {
    // Generate SEO-friendly slug from title
    let baseSlug = this.title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')      // Remove special characters
      .replace(/\s+/g, '-')           // Replace spaces with hyphens
      .replace(/-+/g, '-')            // Multiple hyphens to single
      .replace(/^-|-$/g, '')          // Trim hyphens from edges
      .substring(0, 60);              // Limit length
    
    // Ensure uniqueness
    this.slug = baseSlug;
    let counter = 1;
    const maxRetries = 100;
    
    while (counter < maxRetries) {
      const exists = await Debate.findOne({ slug: this.slug }).select('_id').lean();
      if (!exists) break;
      this.slug = `${baseSlug}-${counter}`;
      counter++;
    }
    
    // Fallback to timestamp if needed
    if (counter >= maxRetries) {
      this.slug = `${baseSlug}-${Date.now()}`;
    }
  }
  next();
});

debateSchema.statics.isExistBySlug = async function (slug: string) {
  return this.findOne({ slug, isDeleted: { $ne: true } });
};

export const Debate = model<IDebateDocument, DebateModel>(
  "Debate",
  debateSchema,
  "debates"
);
