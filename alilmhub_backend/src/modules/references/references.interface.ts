import { Model, Types } from "mongoose";

export type TRefType = "book" | "article" | "hadith" | "quran";

export type TReferences = {
  slug: string;
  type: TRefType;
  title: string;
  author?: string;
  citationText?: string;
  sourceUrl?: string;
  sourceLanguage?: string;
  verified: boolean;
  verifiedBy?: Types.ObjectId;
  createdBy: Types.ObjectId;
};

export type ReferenceModel = {
  isExistBySlug(slug: string): Promise<TReferences | null>;
} & Model<TReferences>;
