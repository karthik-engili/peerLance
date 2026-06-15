/**
 * @file verifyToken.js
 * @description JWT authentication middleware.
 * Extracts token from HTTP-only cookie, verifies it, and attaches decoded user to req.
 * Optionally accepts allowed roles for role-based access control.
 */
import jwt from "jsonwebtoken";
const { verify } = jwt;

export const verifyToken = (...allowedRoles) => {
  return async (req, res, next) => {
    try {
      // get token from cookie
      const token = req.cookies?.token;

      // check token exists
      if (!token) {
        return res.status(401).json({ success: false, message: "Unauthorized — no token provided" });
      }

      // validate token (decode)
      const secret = process.env.SECRET_KEY || process.env.JWT_SECRET;
      const decodedToken = verify(token, secret);

      // check role if roles are specified
      if (allowedRoles.length > 0 && !allowedRoles.includes(decodedToken.role)) {
        return res.status(403).json({ success: false, message: "Forbidden — insufficient permissions" });
      }

      // attach decoded token to request
      req.user = decodedToken;
      next();
    } catch (err) {
      res.status(401).json({ success: false, message: "Invalid or expired token" });
    }
  };
};
