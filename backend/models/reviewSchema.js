/**
 * @file reviewSchema.js
 * @module ReviewSchema
 * @description Review model for post-project feedback.
 * Only clients can review freelancers, one review per completed project.
 */
import mongoose from "mongoose";

export const reviewSchema = new mongoose.Schema(
  {
    reviewer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    freelancer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },

    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },

    comment: { type: String, required: true, maxlength: 1000 },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Enforce one review per project
reviewSchema.index({ project: 1, reviewer: 1 }, { unique: true });
