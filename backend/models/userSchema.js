/**
 * @file userSchema.js
 * @module UserSchema
 * @description Core user model for the Freelance Bid-Portal.
 * Supports two roles: CLIENT (posts projects) and FREELANCER (bids on projects).
 * Includes profile fields, skills, and saved/bookmarked projects.
 */
import mongoose from "mongoose";

export const userSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, trim: true },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true },

    role: {
      type: String,
      enum: ["CLIENT", "FREELANCER"],
      required: true,
    },

    bio: { type: String, default: "", maxlength: 500 },

    skills: [{ type: String, trim: true }],

    avatarUrl: { type: String, default: "" },

    savedProjects: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Project",
      },
    ],
  },
  {
    timestamps: true,
    versionKey: false,
  }
);
