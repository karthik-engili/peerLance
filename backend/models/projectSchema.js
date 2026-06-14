/**
 * @file projectSchema.js
 * @module ProjectSchema
 * @description Project model representing a freelance task posted by a CLIENT.
 * Tracks lifecycle from OPEN → IN_PROGRESS → COMPLETED or CANCELLED.
 * References the client who posted it and all bids received.
 */
import mongoose from "mongoose";

export const projectSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },

    description: { type: String, required: true },

    category: {
      type: String,
      required: true,
      enum: [
        "Web Development",
        "Mobile Development",
        "UI/UX Design",
        "Graphic Design",
        "Content Writing",
        "Data Entry",
        "Video Editing",
        "Other",
      ],
    },

    skillsRequired: [{ type: String, trim: true }],

    budgetMin: { type: Number, required: true, min: 0 },
    budgetMax: { type: Number, required: true, min: 0 },

    deadline: { type: Date, required: true },

    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    bids: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Bid",
      },
    ],

    acceptedBid: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Bid",
      default: null,
    },

    status: {
      type: String,
      enum: ["OPEN", "IN_PROGRESS", "COMPLETED", "CANCELLED"],
      default: "OPEN",
    },

    attachments: [{ type: String }], // Cloudinary URLs
  },
  {
    timestamps: true,
    versionKey: false,
  }
);
