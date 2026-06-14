/**
 * @file isClient.js
 * @description Role-based middleware — restricts access to CLIENT role only.
 * Must be used AFTER verifyToken middleware.
 */
export const isClient = (req, res, next) => {
  if (req.user?.role !== "CLIENT") {
    return res.status(403).json({ success: false, message: "Access denied — clients only" });
  }
  next();
};
