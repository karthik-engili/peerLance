/**
 * @file server.js
 * @description Main entry point for the PeerLance backend.
 * Configures Express, Mongoose, Socket.io for real-time updates, and mounts all REST API routes.
 */
import express from "express";
import { createServer } from "http";
import { Server as SocketIO } from "socket.io";
import { config } from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import connectDB from "./config/db.js";

// Route imports
import { authAPP } from "./routes/authAPI.js";
import { projectAPP } from "./routes/projectAPI.js";
import { bidAPP } from "./routes/bidAPI.js";
import { notificationAPP } from "./routes/notificationAPI.js";
import { profileAPP } from "./routes/profileAPI.js";
import { chatAPP } from "./routes/chatAPI.js";
import { reviewAPP } from "./routes/reviewAPI.js";
import { savedAPP } from "./routes/savedAPI.js";

config({ path: "./.env", encoding: "UTF-8" });

const app = express();
const httpServer = createServer(app);

const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

// ==========================================
// 🔌 SOCKET.IO SETUP
// ==========================================
const io = new SocketIO(httpServer, {
  cors: {
    origin: FRONTEND_URL,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

io.on("connection", (socket) => {
  console.log(`Socket connected: ${socket.id}`);

  // User room — each user joins their own room for targeted notifications
  socket.on("join-user", (userId) => {
    socket.join(`user-${userId}`);
    console.log(`Socket ${socket.id} joined user-${userId}`);
  });

  socket.on("leave-user", (userId) => {
    socket.leave(`user-${userId}`);
  });

  // Project chat room — for real-time messaging
  socket.on("join-project", (projectId) => {
    socket.join(`project-${projectId}`);
    console.log(`Socket ${socket.id} joined project-${projectId}`);
  });

  socket.on("leave-project", (projectId) => {
    socket.leave(`project-${projectId}`);
  });

  // Chat events
  socket.on("send-message", ({ projectId, message }) => {
    socket.to(`project-${projectId}`).emit("receive-message", message);
  });

  socket.on("user-typing", ({ projectId, userName }) => {
    socket.to(`project-${projectId}`).emit("user-typing", { userName });
  });

  socket.on("stop-typing", ({ projectId }) => {
    socket.to(`project-${projectId}`).emit("stop-typing");
  });

  socket.on("disconnect", () => {
    console.log(`Socket disconnected: ${socket.id}`);
  });
});

// Make io available to routes
app.set("io", io);

// ==========================================
// ⚙️ MIDDLEWARE
// ==========================================
app.use(cors({
  origin: FRONTEND_URL,
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

// ==========================================
// 🚦 REST API ROUTES
// ==========================================
app.use("/api/auth", authAPP);
app.use("/api/project", projectAPP);
app.use("/api/bid", bidAPP);
app.use("/api/notification", notificationAPP);
app.use("/api/profile", profileAPP);
app.use("/api/chat", chatAPP);
app.use("/api/review", reviewAPP);
app.use("/api/saved", savedAPP);

// Health check
app.get("/", (req, res) => {
  res.status(200).json({ success: true, message: "PeerLance API is active 🚀" });
});

// ==========================================
// 💾 DATABASE CONNECTION & SERVER STARTUP
// ==========================================
const port = process.env.PORT || 6767;

try {
  await connectDB();
  httpServer.listen(port, () =>
    console.log(`Server + Socket.io listening at port: ${port}`)
  );
} catch (err) {
  console.error("Server startup failed:", err);
}

// ==========================================
// 🛡️ ERROR HANDLERS
// ==========================================

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("Error:", err.name, err.message);

  const errCode = err.code ?? err.cause?.code ?? err.errorResponse?.code;
  const keyValue = err.keyValue ?? err.cause?.keyValue ?? err.errorResponse?.keyValue;

  if (err.name === "ValidationError") {
    return res.status(400).json({ success: false, message: "Validation error", error: err.message });
  }
  if (err.name === "CastError") {
    return res.status(400).json({ success: false, message: "Invalid ID format", error: err.message });
  }
  if (errCode === 11000) {
    const field = Object.keys(keyValue)[0];
    const value = keyValue[field];
    return res.status(409).json({
      success: false,
      message: `${field} "${value}" already exists`,
    });
  }

  res.status(500).json({ success: false, message: "Internal server error" });
});

export default app;
