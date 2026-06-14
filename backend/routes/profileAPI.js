/**
 * @file profileAPI.js
 * @module profileAPI
 * @description Express router for user profile endpoints.
 * Handles profile viewing, updating, and avatar upload.
 */
import express from "express";
import { userModel } from "../models/mainModels.js";
import { verifyToken } from "../middleware/verifyToken.js";
import { upload } from "../config/multer.js";
import { uploadToCloudinary } from "../utils/cloudinaryUpload.js";

export const profileAPP = express.Router();

// GET /api/profile/:id — Get public profile by user ID
profileAPP.get("/:id", async (req, res, next) => {
  try {
    const user = await userModel
      .findById(req.params.id)
      .select("-password -savedProjects");

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.status(200).json({ success: true, message: "Profile fetched", payload: user });
  } catch (err) {
    next(err);
  }
});

// PUT /api/profile — Update own profile
profileAPP.put("/", verifyToken(), async (req, res, next) => {
  try {
    const { firstName, lastName, bio, skills } = req.body;

    const updateData = {};
    if (firstName) updateData.firstName = firstName;
    if (lastName !== undefined) updateData.lastName = lastName;
    if (bio !== undefined) updateData.bio = bio;
    if (skills) {
      updateData.skills = typeof skills === "string"
        ? skills.split(",").map((s) => s.trim()).filter(Boolean)
        : skills;
    }

    const user = await userModel.findByIdAndUpdate(
      req.user.id,
      { $set: updateData },
      { new: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.status(200).json({ success: true, message: "Profile updated", payload: user });
  } catch (err) {
    next(err);
  }
});

// PUT /api/profile/avatar — Upload avatar to Cloudinary
profileAPP.put("/avatar", verifyToken(), upload.single("avatar"), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No file uploaded" });
    }

    const avatarUrl = await uploadToCloudinary(req.file.buffer, "peerlance/avatars");

    const user = await userModel.findByIdAndUpdate(
      req.user.id,
      { $set: { avatarUrl } },
      { new: true }
    ).select("-password");

    res.status(200).json({ success: true, message: "Avatar updated", payload: user });
  } catch (err) {
    next(err);
  }
});
