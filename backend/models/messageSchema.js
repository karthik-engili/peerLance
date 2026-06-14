/**
 * @file messageSchema.js
 * @module MessageSchema
 * @description Chat message model for client-freelancer communication.
 * Messages are scoped to a project — chat unlocks only after a bid is accepted.
 */
import mongoose from "mongoose";

export const messageSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },

    text: { type: String, required: true, maxlength: 2000 },

    isRead: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);
