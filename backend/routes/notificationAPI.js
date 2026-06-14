/**
 * @file notificationAPI.js
 * @module notificationAPI
 * @description Express router for notification endpoints.
 * Handles fetching, marking as read, and marking all as read.
 */
import express from "express";
import { notificationModel } from "../models/mainModels.js";
import { verifyToken } from "../middleware/verifyToken.js";

export const notificationAPP = express.Router();

// GET /api/notification — Get all notifications for logged-in user
notificationAPP.get("/", verifyToken(), async (req, res, next) => {
  try {
    const notifications = await notificationModel
      .find({ recipient: req.user.id })
      .populate("relatedProject", "title status")
      .sort({ createdAt: -1 })
      .limit(50);

    const unreadCount = await notificationModel.countDocuments({
      recipient: req.user.id,
      isRead: false,
    });

    res.status(200).json({
      success: true,
      message: "Notifications fetched",
      payload: { notifications, unreadCount },
    });
  } catch (err) {
    next(err);
  }
});

// PUT /api/notification/:id/read — Mark single notification as read
notificationAPP.put("/:id/read", verifyToken(), async (req, res, next) => {
  try {
    const notification = await notificationModel.findOneAndUpdate(
      { _id: req.params.id, recipient: req.user.id },
      { $set: { isRead: true } },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ success: false, message: "Notification not found" });
    }

    res.status(200).json({ success: true, message: "Marked as read", payload: notification });
  } catch (err) {
    next(err);
  }
});

// PUT /api/notification/read-all — Mark all notifications as read
notificationAPP.put("/read-all", verifyToken(), async (req, res, next) => {
  try {
    await notificationModel.updateMany(
      { recipient: req.user.id, isRead: false },
      { $set: { isRead: true } }
    );

    res.status(200).json({ success: true, message: "All notifications marked as read" });
  } catch (err) {
    next(err);
  }
});
