/**
 * @file rateLimiter.js
 * @description express-rate-limit configurations for preventing
 * brute-force attacks and spam on sensitive endpoints.
 */
import rateLimit from "express-rate-limit";

const isDev = process.env.NODE_ENV !== "production";

// Login endpoint — max 5 attempts per 15 minutes (unlimited in dev)
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isDev ? 1000 : 5,
  message: {
    success: false,
    message: "Too many login attempts. Please try again after 15 minutes.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Registration endpoint — max 3 per hour per IP
export const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: isDev ? 1000 : 3,
  message: {
    success: false,
    message: "Too many registration attempts. Please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Bid submission — max 10 per hour
export const bidLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: isDev ? 1000 : 10,
  message: {
    success: false,
    message: "Too many bid submissions. Please slow down.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});
