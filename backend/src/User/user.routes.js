// ─── Routes: User ──────────────────────────────────────────────────────────
// All user-related endpoints.
//
// Public routes (no JWT required):
//   POST /api/users/register
//   POST /api/users/login
//   POST /api/users/refresh-token
//   GET  /api/users/portfolio/:username
//
// Protected routes (JWT via verifyJWT middleware):
//   POST /api/users/logout
//   GET  /api/users/me
//   PATCH /api/users/profile
//   PATCH /api/users/avatar

import { Router } from "express";
import {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  getCurrentUser,
  updateProfile,
  updateAvatar,
  getPublicProfile,
} from "./user.controller.js";
import { verifyJWT } from "../Middleware/auth.middleware.js";
import { upload } from "../Middleware/multer.middleware.js";

const router = Router();

// ── Public ──────────────────────────────────────────────────────────────
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/refresh-token", refreshAccessToken);
router.get("/portfolio/:username", getPublicProfile);

// ── Protected (require valid JWT) ───────────────────────────────────────
router.post("/logout", verifyJWT, logoutUser);
router.get("/me", verifyJWT, getCurrentUser);
router.patch("/profile", verifyJWT, updateProfile);
router.patch(
  "/avatar",
  verifyJWT,
  upload.single("avatar"), // multer picks up the file field named "avatar"
  updateAvatar
);

export default router;
