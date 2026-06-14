/**
 * @file isFreelancer.js
 * @description Role-based middleware — restricts access to FREELANCER role only.
 * Must be used AFTER verifyToken middleware.
 */
export const isFreelancer = (req, res, next) => {
  if (req.user?.role !== "FREELANCER") {
    return res.status(403).json({ success: false, message: "Access denied — freelancers only" });
  }
  next();
};
