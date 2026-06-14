/**
 * @file bidSchema.js
 * @module BidSchema
 * @description Bid model representing a freelancer's proposal on a project.
 * Tracks proposed price, delivery timeline, and bid status lifecycle.
 */
import mongoose from "mongoose";

export const bidSchema = new mongoose.Schema(
  {
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },

    freelancer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    proposedPrice: { type: Number, required: true, min: 0 },

    deliveryDays: { type: Number, required: true, min: 1 },

    coverNote: { type: String, required: true, maxlength: 1000 },

    status: {
      type: String,
      enum: ["PENDING", "ACCEPTED", "REJECTED", "WITHDRAWN"],
      default: "PENDING",
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Enforce one bid per freelancer per project
bidSchema.index({ project: 1, freelancer: 1 }, { unique: true });
