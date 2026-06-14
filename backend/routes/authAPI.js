/**
 * @file authAPI.js
 * @module authAPI
 * @description Express router for authentication endpoints.
 * Handles register (with role selection), login (JWT cookie), logout, and auth check.
 */
import express from "express";
import { userModel } from "../models/mainModels.js";
import jwt from "jsonwebtoken";
import { hash, compare } from "bcryptjs";
import { verifyToken } from "../middleware/verifyToken.js";
import { loginLimiter, registerLimiter } from "../middleware/rateLimiter.js";
import { registerSchema, loginSchema, validate } from "../validation/authValidation.js";
import { sendEmail, emailTemplates } from "../utils/sendEmail.js";

export const authAPP = express.Router();

// POST /api/auth/register — Create new user with role
authAPP.post("/register", registerLimiter, validate(registerSchema), async (req, res, next) => {
  try {
    const { firstName, lastName, email, password, role } = req.body;

    // check if email already exists
    const existing = await userModel.findOne({ email });
    if (existing) {
      return res.status(409).json({ success: false, message: "Email already registered" });
    }

    // hash password
    const hashedPassword = await hash(password, Number(process.env.SALT) || 12);

    // create user
    const newUser = new userModel({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      role,
    });
    await newUser.save();

    // send welcome email (non-blocking)
    const template = emailTemplates.welcome(firstName);
    sendEmail({ to: email, ...template });

    res.status(201).json({ success: true, message: "Registration successful" });
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/login — Authenticate and set JWT cookie
authAPP.post("/login", loginLimiter, validate(loginSchema), async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // find user
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(400).json({ success: false, message: "Invalid email or password" });
    }

    // compare password
    const passwordMatch = await compare(password, user.password);
    if (!passwordMatch) {
      return res.status(400).json({ success: false, message: "Invalid email or password" });
    }

    // create JWT
    const signedToken = jwt.sign(
      {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        avatarUrl: user.avatarUrl,
      },
      process.env.SECRET_KEY,
      { expiresIn: "7d" }
    );

    // strip password from response
    const userObj = user.toObject();
    delete userObj.password;

    // set cookie
    res.cookie("token", signedToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(200).json({ success: true, message: "Login successful", payload: userObj });
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/logout — Clear JWT cookie
authAPP.post("/logout", (req, res, next) => {
  try {
    if (!req.cookies?.token) {
      return res.status(400).json({ success: false, message: "Not logged in" });
    }

    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      path: "/",
    });

    res.status(200).json({ success: true, message: "Logout successful" });
  } catch (err) {
    next(err);
  }
});

// GET /api/auth/me — Get current logged-in user
authAPP.get("/me", verifyToken(), async (req, res, next) => {
  try {
    const user = await userModel.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    res.status(200).json({ success: true, message: "Authenticated", payload: user });
  } catch (err) {
    next(err);
  }
});
