/**
 * @file notificationSchema.js
 * @module NotificationSchema
 * @description Notification model for in-app real-time alerts.
 * Covers bid events, project lifecycle, and review notifications.
 */
import mongoose from "mongoose";

export const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    type: {
      type: String,
      enum: [
        "NEW_BID",
        "BID_ACCEPTED",
        "BID_REJECTED",
        "BID_WITHDRAWN",
        "PROJECT_COMPLETED",
        "PROJECT_CANCELLED",
        "NEW_REVIEW",
        "NEW_MESSAGE",
      ],
      required: true,
    },

    message: { type: String, required: true },

    isRead: { type: Boolean, default: false },

    relatedProject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);
