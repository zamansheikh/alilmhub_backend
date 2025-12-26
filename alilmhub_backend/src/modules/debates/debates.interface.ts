import { Model, Types, Document } from "mongoose";

export type TDebateStatus = "open" | "closed" | "archived";
export type TDebateStance = "supporting" | "opposing" | "neutral";

export type TDebates = {
  slug: string;
  title: string;
  titleDescription?: string;
  topicId?: Types.ObjectId;
  author: Types.ObjectId;
  supportingMembers: Types.ObjectId[];
  opposingMembers: Types.ObjectId[];
  description: string;
  references: Types.ObjectId[];
  status: TDebateStatus;
  stance: TDebateStance;
  viewsCount: number;
  supportingVotesCount: number;
  opposingVotesCount: number;
  isDeleted?: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export interface IDebateDocument extends TDebates, Document {}

export type DebateModel = {
  isExistBySlug(slug: string): Promise<TDebates | null>;
} & Model<IDebateDocument>;
