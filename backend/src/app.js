// ─── Express Application ───────────────────────────────────────────────────
// Configures the Express app:
//   - Security & parsing middleware (cors, cookie-parser, json, urlencoded)
//   - Route mounting (user routes, post routes)
//   - Global error handler
//
// This file does NOT start the HTTP server — that responsibility belongs to
// server.js so that the app remains independently testable.

import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { ApiError } from "./Utils/ApiError.js";

// ── Route imports ─────────────────────────────────────────────────────────
import userRouter from "./User/user.routes.js";
import postRouter from "./posts/post.routes.js";

const app = express();

// ── CORS ────────────────────────────────────────────────────────────────
// Allow requests only from the frontend origin defined in .env
app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true, // Required to send/receive httpOnly cookies
  })
);

// ── Body Parsing ─────────────────────────────────────────────────────────
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));

// ── Cookie Parsing ───────────────────────────────────────────────────────
app.use(cookieParser());

// ── Static Files ─────────────────────────────────────────────────────────
// Serve files in /public (e.g., temp uploads before Cloudinary push)
app.use(express.static("public"));

// ── Routes ───────────────────────────────────────────────────────────────
app.use("/api/users", userRouter);
app.use("/api/posts", postRouter);

// ── Health Check ─────────────────────────────────────────────────────────
app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
});

// ── Catch-All 404 Route Handler ──────────────────────────────────────────
app.use((req, res, next) => {
  next(new ApiError(404, `Route ${req.originalUrl} not found`));
});

// ── Global Error Handler ──────────────────────────────────────────────────
// Catches any error forwarded via next(err) from controllers.
// ApiError instances return their own statusCode; all others default to 500.
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  return res.status(statusCode).json({
    success: false,
    statusCode,
    message,
    errors: err.errors || [],
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
});

export { app };
