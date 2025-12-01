import { model, Schema } from "mongoose";
import { DebateModel, IDebateDocument } from "./debates.interface";

const debateSchema = new Schema<IDebateDocument>(
  {
    slug: {
      type: String,
      required: false,
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

debateSchema.index({ title: 1 });
debateSchema.index({ topicId: 1 });
debateSchema.index({ author: 1 });
debateSchema.index({ status: 1 });
debateSchema.index({ isDeleted: 1 });
debateSchema.index({ createdAt: -1 });

debateSchema.pre("save", async function (next) {
  if (!this.slug) {
    const lastDebate = await Debate.findOne()
      .sort({ createdAt: -1 })
      .select("slug");
    
    let nextNumber = 1;
    if (lastDebate?.slug) {
      const match = lastDebate.slug.match(/DEB_(\d+)/);
      if (match) {
        nextNumber = parseInt(match[1], 10) + 1;
      }
    }
    
    this.slug = `DEB_${nextNumber}`;
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
