/**
 * @file bidAPI.js
 * @module bidAPI
 * @description Express router for bid management endpoints.
 * Handles bid submission, editing, withdrawal, acceptance, and rejection.
 */
import express from "express";
import { bidModel, projectModel, notificationModel } from "../models/mainModels.js";
import { verifyToken } from "../middleware/verifyToken.js";
import { isFreelancer } from "../middleware/isFreelancer.js";
import { isClient } from "../middleware/isClient.js";
import { bidLimiter } from "../middleware/rateLimiter.js";
import { sendEmail, emailTemplates } from "../utils/sendEmail.js";

export const bidAPP = express.Router();

// POST /api/bid — Submit bid (Freelancer only)
bidAPP.post("/", verifyToken("FREELANCER"), isFreelancer, bidLimiter, async (req, res, next) => {
  try {
    const { projectId, proposedPrice, deliveryDays, coverNote } = req.body;

    const project = await projectModel.findById(projectId).populate("client", "firstName lastName");
    if (!project) return res.status(404).json({ success: false, message: "Project not found" });
    if (project.status !== "OPEN") return res.status(400).json({ success: false, message: "Project is no longer accepting bids" });

    const bid = new bidModel({ project: projectId, freelancer: req.user.id, proposedPrice, deliveryDays, coverNote });
    await bid.save();

    project.bids.push(bid._id);
    await project.save();

    // notification for client
    const notification = new notificationModel({
      recipient: project.client._id, type: "NEW_BID",
      message: `${req.user.firstName} submitted a bid of ₹${proposedPrice} on "${project.title}"`,
      relatedProject: projectId,
    });
    await notification.save();

    // socket event
    const io = req.app.get("io");
    if (io) io.to(`user-${project.client._id}`).emit("new-bid", { bid, projectTitle: project.title });

    res.status(201).json({ success: true, message: "Bid submitted", payload: bid });
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ success: false, message: "You have already bid on this project" });
    next(err);
  }
});

// GET /api/bid/project/:id — Get all bids for a project
bidAPP.get("/project/:id", verifyToken(), async (req, res, next) => {
  try {
    const bids = await bidModel.find({ project: req.params.id })
      .populate("freelancer", "firstName lastName avatarUrl skills")
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, message: "Bids fetched", payload: bids });
  } catch (err) { next(err); }
});

// GET /api/bid/my — Get freelancer's own bids (paginated)
bidAPP.get("/my", verifyToken("FREELANCER"), async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 10));
    const skip = (page - 1) * limit;
    const filter = { freelancer: req.user.id };
    if (req.query.status) filter.status = req.query.status.toUpperCase();

    const [bids, totalCount] = await Promise.all([
      bidModel.find(filter).populate("project", "title category budgetMin budgetMax deadline status").sort({ createdAt: -1 }).skip(skip).limit(limit),
      bidModel.countDocuments(filter),
    ]);

    res.status(200).json({ success: true, message: "My bids fetched", payload: { bids, totalCount, currentPage: page, totalPages: Math.ceil(totalCount / limit) } });
  } catch (err) { next(err); }
});

// PUT /api/bid/:id — Edit bid (Freelancer, while PENDING)
bidAPP.put("/:id", verifyToken("FREELANCER"), async (req, res, next) => {
  try {
    const bid = await bidModel.findById(req.params.id);
    if (!bid) return res.status(404).json({ success: false, message: "Bid not found" });
    if (bid.freelancer.toString() !== req.user.id) return res.status(403).json({ success: false, message: "Not your bid" });
    if (bid.status !== "PENDING") return res.status(400).json({ success: false, message: "Can only edit pending bids" });

    const { proposedPrice, deliveryDays, coverNote } = req.body;
    if (proposedPrice !== undefined) bid.proposedPrice = proposedPrice;
    if (deliveryDays !== undefined) bid.deliveryDays = deliveryDays;
    if (coverNote !== undefined) bid.coverNote = coverNote;
    await bid.save();

    res.status(200).json({ success: true, message: "Bid updated", payload: bid });
  } catch (err) { next(err); }
});

// DELETE /api/bid/:id — Withdraw bid (Freelancer)
bidAPP.delete("/:id", verifyToken("FREELANCER"), async (req, res, next) => {
  try {
    const bid = await bidModel.findById(req.params.id);
    if (!bid) return res.status(404).json({ success: false, message: "Bid not found" });
    if (bid.freelancer.toString() !== req.user.id) return res.status(403).json({ success: false, message: "Not your bid" });
    if (bid.status !== "PENDING") return res.status(400).json({ success: false, message: "Can only withdraw pending bids" });

    bid.status = "WITHDRAWN";
    await bid.save();
    await projectModel.findByIdAndUpdate(bid.project, { $pull: { bids: bid._id } });

    const project = await projectModel.findById(bid.project);
    if (project) {
      await new notificationModel({ recipient: project.client, type: "BID_WITHDRAWN", message: `A bid was withdrawn on "${project.title}"`, relatedProject: project._id }).save();
      const io = req.app.get("io");
      if (io) io.to(`user-${project.client}`).emit("bid-withdrawn", { bidId: bid._id, projectId: project._id });
    }

    res.status(200).json({ success: true, message: "Bid withdrawn" });
  } catch (err) { next(err); }
});

// PUT /api/bid/:id/accept — Accept bid (Client owner)
bidAPP.put("/:id/accept", verifyToken("CLIENT"), isClient, async (req, res, next) => {
  try {
    const bid = await bidModel.findById(req.params.id).populate("freelancer", "firstName lastName email");
    if (!bid) return res.status(404).json({ success: false, message: "Bid not found" });

    const project = await projectModel.findById(bid.project);
    if (!project) return res.status(404).json({ success: false, message: "Project not found" });
    if (project.client.toString() !== req.user.id) return res.status(403).json({ success: false, message: "Not your project" });
    if (project.status !== "OPEN") return res.status(400).json({ success: false, message: "A bid has already been accepted" });

    // accept this bid
    bid.status = "ACCEPTED";
    await bid.save();
    project.status = "IN_PROGRESS";
    project.acceptedBid = bid._id;
    await project.save();

    // reject all other pending bids
    const otherBids = await bidModel.find({ project: project._id, _id: { $ne: bid._id }, status: "PENDING" }).populate("freelancer", "firstName email");
    for (const ob of otherBids) {
      ob.status = "REJECTED";
      await ob.save();
      await new notificationModel({ recipient: ob.freelancer._id, type: "BID_REJECTED", message: `Your bid on "${project.title}" was not selected`, relatedProject: project._id }).save();
      const io = req.app.get("io");
      if (io) io.to(`user-${ob.freelancer._id}`).emit("bid-rejected", { bidId: ob._id, projectTitle: project.title });
      sendEmail({ to: ob.freelancer.email, ...emailTemplates.bidRejected(ob.freelancer.firstName, project.title) });
    }

    // notify accepted freelancer
    await new notificationModel({ recipient: bid.freelancer._id, type: "BID_ACCEPTED", message: `Your bid on "${project.title}" was accepted! 🎉`, relatedProject: project._id }).save();
    const io = req.app.get("io");
    if (io) io.to(`user-${bid.freelancer._id}`).emit("bid-accepted", { bidId: bid._id, projectId: project._id, projectTitle: project.title });
    sendEmail({ to: bid.freelancer.email, ...emailTemplates.bidAccepted(bid.freelancer.firstName, project.title) });

    res.status(200).json({ success: true, message: "Bid accepted", payload: bid });
  } catch (err) { next(err); }
});

// PUT /api/bid/:id/reject — Reject a single bid (Client owner)
bidAPP.put("/:id/reject", verifyToken("CLIENT"), isClient, async (req, res, next) => {
  try {
    const bid = await bidModel.findById(req.params.id).populate("freelancer", "firstName email");
    if (!bid) return res.status(404).json({ success: false, message: "Bid not found" });

    const project = await projectModel.findById(bid.project);
    if (!project) return res.status(404).json({ success: false, message: "Project not found" });
    if (project.client.toString() !== req.user.id) return res.status(403).json({ success: false, message: "Not your project" });
    if (bid.status !== "PENDING") return res.status(400).json({ success: false, message: "Can only reject pending bids" });

    bid.status = "REJECTED";
    await bid.save();
    await new notificationModel({ recipient: bid.freelancer._id, type: "BID_REJECTED", message: `Your bid on "${project.title}" was rejected`, relatedProject: project._id }).save();

    const io = req.app.get("io");
    if (io) io.to(`user-${bid.freelancer._id}`).emit("bid-rejected", { bidId: bid._id, projectTitle: project.title });
    sendEmail({ to: bid.freelancer.email, ...emailTemplates.bidRejected(bid.freelancer.firstName, project.title) });

    res.status(200).json({ success: true, message: "Bid rejected" });
  } catch (err) { next(err); }
});
