import { model, Schema } from "mongoose";
import { TReferences, ReferenceModel } from "./references.interface";

const referenceSchema = new Schema<TReferences>(
  {
    slug: {
      type: String,
      required: true,
      trim: true,
      unique: true,
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
    createdBy:{
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
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

referenceSchema.index({ type: 1 });
referenceSchema.index({ verified: 1 });
referenceSchema.index({ createdAt: -1 });

referenceSchema.pre("save", async function (next) {
  // Prevent slug modification on existing documents
  if (!this.isNew && this.isModified("slug")) {
    throw new Error(
      "Slug cannot be modified after creation."
    );
  }

  if (!this.slug && this.isNew) {
    // Use timestamp + random to avoid race conditions
    // Format: REF_1733990400123_abc
    const timestamp = Date.now();
    const randomSuffix = Math.random().toString(36).substring(2, 5);
    this.slug = `REF_${timestamp}_${randomSuffix}`;
    
    // Ensure uniqueness (unlikely but possible collision)
    let counter = 1;
    while (counter < 5) {
      const exists = await Reference.findOne({ slug: this.slug }).lean();
      if (!exists) break;
      this.slug = `REF_${timestamp}_${randomSuffix}_${counter}`;
      counter++;
    }
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
