import { Model, Types, Document } from "mongoose";

export type TDebateArguments = {
  debateId: Types.ObjectId;
  author: Types.ObjectId;
  argumentText: string;
  type: "supporting" | "opposing";
  references: Types.ObjectId[];
  upVotes: number;
  downVotes: number;
  isDeleted?: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export interface IDebateArgumentDocument extends TDebateArguments, Document {}

export type DebateArgumentModel = Model<IDebateArgumentDocument>;
