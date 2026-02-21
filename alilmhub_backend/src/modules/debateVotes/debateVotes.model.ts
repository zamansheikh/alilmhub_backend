import { model, Schema } from "mongoose";
import { DebateVoteModel, IDebateVoteDocument } from "./debateVotes.interface";

const debateVoteSchema = new Schema<IDebateVoteDocument>(
  {
    debateId: { type: Schema.Types.ObjectId, ref: "Debate", required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    vote: { type: String, enum: ["supporting", "opposing"], required: true },
  },
  { timestamps: true, versionKey: false }
);

// One vote per user per debate
debateVoteSchema.index({ debateId: 1, userId: 1 }, { unique: true });
debateVoteSchema.index({ debateId: 1 });

export const DebateVote = model<IDebateVoteDocument, DebateVoteModel>(
  "DebateVote",
  debateVoteSchema,
  "debateVotes"
);
