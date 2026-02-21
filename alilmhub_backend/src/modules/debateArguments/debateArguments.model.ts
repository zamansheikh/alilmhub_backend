import { model, Schema } from "mongoose";
import {
  DebateArgumentModel,
  IDebateArgumentDocument,
} from "./debateArguments.interface";

const debateArgumentSchema = new Schema<IDebateArgumentDocument>(
  {
    debateId: {
      type: Schema.Types.ObjectId,
      ref: "Debate",
      required: true,
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    argumentText: {
      type: String,
      required: true,
      trim: true,
      maxlength: 5000,
    },
    type: {
      type: String,
      enum: ["supporting", "opposing"],
      required: true,
    },
    references: [
      {
        type: Schema.Types.ObjectId,
        ref: "Reference",
      },
    ],
    upVotes: { type: Number, default: 0 },
    downVotes: { type: Number, default: 0 },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true, versionKey: false }
);

debateArgumentSchema.index({ debateId: 1, isDeleted: 1 });
debateArgumentSchema.index({ author: 1 });
debateArgumentSchema.index({ type: 1 });
debateArgumentSchema.index({ createdAt: -1 });

export const DebateArgument = model<
  IDebateArgumentDocument,
  DebateArgumentModel
>("DebateArgument", debateArgumentSchema, "debateArguments");
