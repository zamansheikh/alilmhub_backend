import { model, Schema } from "mongoose";
import { TReferences, ReferenceModel } from "./references.interface";

const referenceSchema = new Schema<TReferences>(
  {
    slug: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ["book", "article", "hadith", "quran"],
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    author: {
      type: String,
      trim: true,
    },
    citationText: {
      type: String,
      trim: true,
    },
    sourceUrl: {
      type: String,
      trim: true,
    },
    sourceLanguage: {
      type: String,
      trim: true,
    },
    verified: {
      type: Boolean,
      default: false,
    },
    verifiedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    stance: {
      type: String,
      enum: ["supporting", "opposing", "neutral"],
      default: "neutral",
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

referenceSchema.index({ slug: 1 });
referenceSchema.index({ type: 1 });
referenceSchema.index({ verified: 1 });
referenceSchema.index({ createdAt: -1 });

referenceSchema.pre("save", async function (next) {
  if (!this.slug) {
    const lastReference = await Reference.findOne()
      .sort({ createdAt: -1 })
      .select("slug");
    
    let nextNumber = 1;
    if (lastReference?.slug) {
      const match = lastReference.slug.match(/REF_(\d+)/);
      if (match) {
        nextNumber = parseInt(match[1], 10) + 1;
      }
    }
    
    this.slug = `REF_${nextNumber}`;
  }
  next();
});

referenceSchema.statics.isExistBySlug = async function (slug: string) {
  return this.findOne({ slug });
};

export const Reference = model<TReferences, ReferenceModel>(
  "Reference",
  referenceSchema,
  "references"
);
