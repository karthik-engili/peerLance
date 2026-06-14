/**
 * @file chatAPI.js
 * @module chatAPI
 * @description Express router for chat endpoints.
 * Chat is project-scoped — unlocks only after a bid is accepted.
 * Messages persist in MongoDB for full history on reload.
 */
import express from "express";
import { messageModel, projectModel } from "../models/mainModels.js";
import { verifyToken } from "../middleware/verifyToken.js";

export const chatAPP = express.Router();

// GET /api/chat/:projectId — Load chat history for a project
chatAPP.get("/:projectId", verifyToken(), async (req, res, next) => {
  try {
    const project = await projectModel.findById(req.params.projectId).populate("acceptedBid");

    if (!project) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }

    // verify user is either the client or the accepted freelancer
    const isClient = project.client.toString() === req.user.id;
    const isFreelancer = project.acceptedBid?.freelancer?.toString() === req.user.id;
    if (!isClient && !isFreelancer) {
      return res.status(403).json({ success: false, message: "Access denied — not a participant" });
    }

    if (!["IN_PROGRESS", "COMPLETED"].includes(project.status)) {
      return res.status(400).json({ success: false, message: "Chat is not available for this project" });
    }

    const messages = await messageModel
      .find({ project: req.params.projectId })
      .populate("sender", "firstName lastName avatarUrl")
      .sort({ createdAt: 1 });

    res.status(200).json({ success: true, message: "Chat history loaded", payload: messages });
  } catch (err) {
    next(err);
  }
});

// POST /api/chat — Send a message
chatAPP.post("/", verifyToken(), async (req, res, next) => {
  try {
    const { projectId, receiverId, text } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({ success: false, message: "Message text is required" });
    }

    const project = await projectModel.findById(projectId).populate("acceptedBid");
    if (!project) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }

    // verify participation
    const isClient = project.client.toString() === req.user.id;
    const isFreelancer = project.acceptedBid?.freelancer?.toString() === req.user.id;
    if (!isClient && !isFreelancer) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    const message = new messageModel({
      sender: req.user.id,
      receiver: receiverId,
      project: projectId,
      text: text.trim(),
    });
    await message.save();

    // populate sender for the response
    await message.populate("sender", "firstName lastName avatarUrl");

    // emit via Socket.io
    const io = req.app.get("io");
    if (io) {
      io.to(`project-${projectId}`).emit("receive-message", message);
      io.to(`user-${receiverId}`).emit("new-message-notification", {
        projectId,
        senderName: `${req.user.firstName} ${req.user.lastName || ""}`.trim(),
      });
    }

    res.status(201).json({ success: true, message: "Message sent", payload: message });
  } catch (err) {
    next(err);
  }
});

// PUT /api/chat/:projectId/read — Mark all messages as read in a project chat
chatAPP.put("/:projectId/read", verifyToken(), async (req, res, next) => {
  try {
    await messageModel.updateMany(
      { project: req.params.projectId, receiver: req.user.id, isRead: false },
      { $set: { isRead: true } }
    );

    res.status(200).json({ success: true, message: "Messages marked as read" });
  } catch (err) {
    next(err);
  }
});
