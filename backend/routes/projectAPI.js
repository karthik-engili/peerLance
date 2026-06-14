/**
 * @file projectAPI.js
 * @module projectAPI
 * @description Express router for project CRUD endpoints.
 * Handles project creation, listing (with pagination), detail view, update, delete, and completion.
 */
import express from "express";
import { projectModel, bidModel, userModel } from "../models/mainModels.js";
import { verifyToken } from "../middleware/verifyToken.js";
import { isClient } from "../middleware/isClient.js";
import { upload } from "../config/multer.js";
import { uploadToCloudinary } from "../utils/cloudinaryUpload.js";

export const projectAPP = express.Router();

// POST /api/project — Create a new project (Client only)
projectAPP.post("/", verifyToken("CLIENT"), isClient, upload.array("attachments", 5), async (req, res, next) => {
  try {
    const { title, description, category, skillsRequired, budgetMin, budgetMax, deadline } = req.body;

    // upload attachments to Cloudinary
    const attachmentUrls = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const url = await uploadToCloudinary(file.buffer, "peerlance/projects");
        attachmentUrls.push(url);
      }
    }

    // parse skills if sent as comma-separated string
    const parsedSkills = typeof skillsRequired === "string"
      ? skillsRequired.split(",").map((s) => s.trim()).filter(Boolean)
      : skillsRequired || [];

    const project = new projectModel({
      title,
      description,
      category,
      skillsRequired: parsedSkills,
      budgetMin: Number(budgetMin),
      budgetMax: Number(budgetMax),
      deadline: new Date(deadline),
      client: req.user.id,
      attachments: attachmentUrls,
    });

    await project.save();
    res.status(201).json({ success: true, message: "Project created", payload: project });
  } catch (err) {
    next(err);
  }
});

// GET /api/project — Get all open projects (with pagination & filters)
projectAPP.get("/", async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 10));
    const skip = (page - 1) * limit;

    // build filter query
    const filter = {};
    if (req.query.status) {
      filter.status = req.query.status.toUpperCase();
    } else {
      filter.status = "OPEN"; // default to open projects
    }
    if (req.query.category) {
      filter.category = req.query.category;
    }
    if (req.query.budgetMin) {
      filter.budgetMax = { $gte: Number(req.query.budgetMin) };
    }
    if (req.query.budgetMax) {
      filter.budgetMin = { ...filter.budgetMin, $lte: Number(req.query.budgetMax) };
    }
    if (req.query.search) {
      filter.$or = [
        { title: { $regex: req.query.search, $options: "i" } },
        { description: { $regex: req.query.search, $options: "i" } },
      ];
    }

    const [projects, totalCount] = await Promise.all([
      projectModel
        .find(filter)
        .populate("client", "firstName lastName avatarUrl")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      projectModel.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      message: "Projects fetched",
      payload: {
        projects,
        totalCount,
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit),
      },
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/project/my — Get logged-in client's projects
projectAPP.get("/my", verifyToken("CLIENT"), async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 10));
    const skip = (page - 1) * limit;

    const filter = { client: req.user.id };
    if (req.query.status) filter.status = req.query.status.toUpperCase();

    const [projects, totalCount] = await Promise.all([
      projectModel
        .find(filter)
        .populate("bids")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      projectModel.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      message: "My projects fetched",
      payload: {
        projects,
        totalCount,
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit),
      },
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/project/:id — Get project by ID with populated bids
projectAPP.get("/:id", async (req, res, next) => {
  try {
    const project = await projectModel
      .findById(req.params.id)
      .populate("client", "firstName lastName avatarUrl email")
      .populate({
        path: "bids",
        populate: { path: "freelancer", select: "firstName lastName avatarUrl skills" },
      })
      .populate({
        path: "acceptedBid",
        populate: { path: "freelancer", select: "firstName lastName avatarUrl" },
      });

    if (!project) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }

    res.status(200).json({ success: true, message: "Project details", payload: project });
  } catch (err) {
    next(err);
  }
});

// PUT /api/project/:id — Update project (Client owner only)
projectAPP.put("/:id", verifyToken("CLIENT"), async (req, res, next) => {
  try {
    const project = await projectModel.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }
    if (project.client.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: "Not your project" });
    }
    if (project.status !== "OPEN") {
      return res.status(400).json({ success: false, message: "Can only edit open projects" });
    }

    const { title, description, category, skillsRequired, budgetMin, budgetMax, deadline } = req.body;

    if (title) project.title = title;
    if (description) project.description = description;
    if (category) project.category = category;
    if (skillsRequired) {
      project.skillsRequired = typeof skillsRequired === "string"
        ? skillsRequired.split(",").map((s) => s.trim()).filter(Boolean)
        : skillsRequired;
    }
    if (budgetMin !== undefined) project.budgetMin = Number(budgetMin);
    if (budgetMax !== undefined) project.budgetMax = Number(budgetMax);
    if (deadline) project.deadline = new Date(deadline);

    await project.save();
    res.status(200).json({ success: true, message: "Project updated", payload: project });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/project/:id — Delete project (Client owner only)
projectAPP.delete("/:id", verifyToken("CLIENT"), async (req, res, next) => {
  try {
    const project = await projectModel.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }
    if (project.client.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: "Not your project" });
    }

    // delete all associated bids
    await bidModel.deleteMany({ project: project._id });

    // remove from all users' savedProjects
    await userModel.updateMany(
      { savedProjects: project._id },
      { $pull: { savedProjects: project._id } }
    );

    await projectModel.findByIdAndDelete(req.params.id);

    // emit socket event for project cancellation
    const io = req.app.get("io");
    if (io) {
      project.bids.forEach((bidId) => {
        // Freelancers will be notified via notification system
      });
    }

    res.status(200).json({ success: true, message: "Project deleted" });
  } catch (err) {
    next(err);
  }
});

// PUT /api/project/:id/complete — Mark project as completed (Client owner only)
projectAPP.put("/:id/complete", verifyToken("CLIENT"), async (req, res, next) => {
  try {
    const project = await projectModel
      .findById(req.params.id)
      .populate({
        path: "acceptedBid",
        populate: { path: "freelancer", select: "firstName lastName email" },
      });

    if (!project) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }
    if (project.client.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: "Not your project" });
    }
    if (project.status !== "IN_PROGRESS") {
      return res.status(400).json({ success: false, message: "Project must be in progress to complete" });
    }

    project.status = "COMPLETED";
    await project.save();

    // notify freelancer via socket
    const io = req.app.get("io");
    if (io && project.acceptedBid?.freelancer) {
      const freelancerId = project.acceptedBid.freelancer._id.toString();
      io.to(`user-${freelancerId}`).emit("project-completed", {
        projectId: project._id,
        title: project.title,
      });
    }

    res.status(200).json({ success: true, message: "Project marked as completed", payload: project });
  } catch (err) {
    next(err);
  }
});
