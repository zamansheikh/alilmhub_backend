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
      enum: ["supporting", "opposing"],
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

debateSchema.pre("save", async function (next) {
  if (!this.slug && this.isNew) {
    // Use timestamp + random to avoid race conditions
    // Format: DEB_1733990400123_abc
    const timestamp = Date.now();
    const randomSuffix = Math.random().toString(36).substring(2, 5);
    this.slug = `DEB_${timestamp}_${randomSuffix}`;
    
    // Ensure uniqueness (unlikely but possible collision)
    let counter = 1;
    while (counter < 5) {
      const exists = await Debate.findOne({ slug: this.slug }).lean();
      if (!exists) break;
      this.slug = `DEB_${timestamp}_${randomSuffix}_${counter}`;
      counter++;
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
