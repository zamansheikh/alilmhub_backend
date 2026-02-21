import { Model, Types, Document } from "mongoose";

export type TDebateVotes = {
  debateId: Types.ObjectId;
  userId: Types.ObjectId;
  vote: "supporting" | "opposing";
  createdAt: Date;
  updatedAt: Date;
};

export interface IDebateVoteDocument extends TDebateVotes, Document {}
export type DebateVoteModel = Model<IDebateVoteDocument>;
