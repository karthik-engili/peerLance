/**
 * @file mainModels.js
 * @module MainModels
 * @description Centralized export file for all compiled Mongoose models.
 * This simplifies importing models across different API routes.
 */
import { model } from "mongoose";
import { userSchema } from "./userSchema.js";
import { projectSchema } from "./projectSchema.js";
import { bidSchema } from "./bidSchema.js";
import { notificationSchema } from "./notificationSchema.js";
import { messageSchema } from "./messageSchema.js";
import { reviewSchema } from "./reviewSchema.js";

// Models
export const userModel = model("User", userSchema);
export const projectModel = model("Project", projectSchema);
export const bidModel = model("Bid", bidSchema);
export const notificationModel = model("Notification", notificationSchema);
export const messageModel = model("Message", messageSchema);
export const reviewModel = model("Review", reviewSchema);
