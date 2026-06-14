/**
 * @file authValidation.js
 * @description Zod validation schemas for authentication endpoints.
 * Validates request body structure before hitting the database.
 */
import { z } from "zod";

export const registerSchema = z.object({
  firstName: z
    .string()
    .min(2, "First name must be at least 2 characters")
    .max(50, "First name must be under 50 characters")
    .trim(),

  lastName: z
    .string()
    .max(50, "Last name must be under 50 characters")
    .trim()
    .optional(),

  email: z
    .string()
    .email("Invalid email format")
    .toLowerCase()
    .trim(),

  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .max(100, "Password must be under 100 characters"),

  role: z.enum(["CLIENT", "FREELANCER"], {
    errorMap: () => ({ message: "Role must be CLIENT or FREELANCER" }),
  }),
});

export const loginSchema = z.object({
  email: z
    .string()
    .email("Invalid email format")
    .toLowerCase()
    .trim(),

  password: z
    .string()
    .min(1, "Password is required"),
});

/**
 * Middleware factory — validates req.body against a Zod schema.
 * Returns 400 with detailed field errors on failure.
 */
export const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);

  if (!result.success) {
    const errors = result.error.errors.map((err) => ({
      field: err.path.join("."),
      message: err.message,
    }));
    return res.status(400).json({ success: false, message: "Validation failed", errors });
  }

  req.body = result.data; // use sanitized data
  next();
};
