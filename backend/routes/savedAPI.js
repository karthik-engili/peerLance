/**
 * @file savedAPI.js
 * @module savedAPI
 * @description Express router for saved/bookmarked project endpoints.
 * Freelancers can bookmark open projects for later viewing.
 */
import express from "express";
import { userModel, projectModel } from "../models/mainModels.js";
import { verifyToken } from "../middleware/verifyToken.js";
import { isFreelancer } from "../middleware/isFreelancer.js";

export const savedAPP = express.Router();

// POST /api/saved/:projectId — Toggle save/unsave a project
savedAPP.post("/:projectId", verifyToken("FREELANCER"), isFreelancer, async (req, res, next) => {
  try {
    const { projectId } = req.params;

    // verify project exists
    const project = await projectModel.findById(projectId);
    if (!project) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }

    const user = await userModel.findById(req.user.id);
    const isSaved = user.savedProjects.includes(projectId);

    if (isSaved) {
      // unsave
      await userModel.findByIdAndUpdate(req.user.id, {
        $pull: { savedProjects: projectId },
      });
      res.status(200).json({ success: true, message: "Project removed from saved", saved: false });
    } else {
      // save
      await userModel.findByIdAndUpdate(req.user.id, {
        $addToSet: { savedProjects: projectId },
      });
      res.status(200).json({ success: true, message: "Project saved", saved: true });
    }
  } catch (err) {
    next(err);
  }
});

// GET /api/saved — Get all saved projects for the logged-in freelancer
savedAPP.get("/", verifyToken("FREELANCER"), async (req, res, next) => {
  try {
    const user = await userModel
      .findById(req.user.id)
      .populate({
        path: "savedProjects",
        populate: { path: "client", select: "firstName lastName avatarUrl" },
        options: { sort: { createdAt: -1 } },
      });

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // filter out any deleted projects
    const activeProjects = user.savedProjects.filter((p) => p !== null);

    res.status(200).json({
      success: true,
      message: "Saved projects fetched",
      payload: activeProjects,
    });
  } catch (err) {
    next(err);
  }
});
