import { Model, Types, Document } from "mongoose";

export type TDiscussionStatus = "open" | "closed";
export type TOpinionStance = "supporting" | "opposing";

export type TOpinion = {
  _id?: Types.ObjectId;
  author: Types.ObjectId;
  text: string;
  stance: TOpinionStance;
  createdAt: Date;
};

export type TDiscussion = {
  slug: string;
  title: string;
  description?: string;
  topicId?: Types.ObjectId;
  author: Types.ObjectId;
  opinions: TOpinion[];
  supportingCount: number;
  opposingCount: number;
  status: TDiscussionStatus;
  viewsCount: number;
  isDeleted?: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export interface IDiscussionDocument extends TDiscussion, Document {}

export type DiscussionModel = {
  isExistBySlug(slug: string): Promise<TDiscussion | null>;
} & Model<IDiscussionDocument>;
