/**
 * @file reviewAPI.js
 * @module reviewAPI
 * @description Express router for review endpoints.
 * Only clients can review freelancers, and only after project completion.
 * One review per project enforced via compound index.
 */
import express from "express";
import { reviewModel, projectModel, notificationModel, userModel } from "../models/mainModels.js";
import { verifyToken } from "../middleware/verifyToken.js";
import { isClient } from "../middleware/isClient.js";
import { sendEmail, emailTemplates } from "../utils/sendEmail.js";

export const reviewAPP = express.Router();

// POST /api/review — Submit a review (Client only, after project completion)
reviewAPP.post("/", verifyToken("CLIENT"), isClient, async (req, res, next) => {
  try {
    const { projectId, rating, comment } = req.body;

    // validate rating range
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, message: "Rating must be between 1 and 5" });
    }

    // verify project exists, is completed, and belongs to this client
    const project = await projectModel.findById(projectId).populate({
      path: "acceptedBid",
      populate: { path: "freelancer", select: "firstName lastName email" },
    });

    if (!project) return res.status(404).json({ success: false, message: "Project not found" });
    if (project.client.toString() !== req.user.id) return res.status(403).json({ success: false, message: "Not your project" });
    if (project.status !== "COMPLETED") return res.status(400).json({ success: false, message: "Project must be completed before reviewing" });
    if (!project.acceptedBid?.freelancer) return res.status(400).json({ success: false, message: "No freelancer to review" });

    const freelancer = project.acceptedBid.freelancer;

    const review = new reviewModel({
      reviewer: req.user.id,
      freelancer: freelancer._id,
      project: projectId,
      rating: Number(rating),
      comment,
    });
    await review.save();

    // notification for freelancer
    const notification = new notificationModel({
      recipient: freelancer._id,
      type: "NEW_REVIEW",
      message: `You received a ${rating}★ review on "${project.title}"`,
      relatedProject: projectId,
    });
    await notification.save();

    // socket event
    const io = req.app.get("io");
    if (io) {
      io.to(`user-${freelancer._id}`).emit("new-review", {
        review,
        projectTitle: project.title,
      });
    }

    // email notification
    sendEmail({
      to: freelancer.email,
      ...emailTemplates.newReview(freelancer.firstName, rating, project.title),
    });

    res.status(201).json({ success: true, message: "Review submitted", payload: review });
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ success: false, message: "You have already reviewed this project" });
    next(err);
  }
});

// GET /api/review/freelancer/:id — Get all reviews for a freelancer
reviewAPP.get("/freelancer/:id", async (req, res, next) => {
  try {
    const reviews = await reviewModel
      .find({ freelancer: req.params.id })
      .populate("reviewer", "firstName lastName avatarUrl")
      .populate("project", "title")
      .sort({ createdAt: -1 });

    // calculate average rating
    const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
    const averageRating = reviews.length > 0 ? (totalRating / reviews.length).toFixed(1) : 0;

    res.status(200).json({
      success: true,
      message: "Reviews fetched",
      payload: { reviews, averageRating: Number(averageRating), totalReviews: reviews.length },
    });
  } catch (err) {
    next(err);
  }
});
