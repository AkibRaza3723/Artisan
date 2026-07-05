// ─── Routes: Posts ─────────────────────────────────────────────────────────
// All artwork post endpoints.
//
// Public routes (no JWT required):
//   GET /api/posts/public/:username
//
// Protected routes (JWT via verifyJWT middleware):
//   POST   /api/posts/              — create post (multipart form with image)
//   GET    /api/posts/              — get own posts (paginated)
//   PATCH  /api/posts/:postId       — update post title/caption/tags
//   DELETE /api/posts/:postId       — delete post + remove from Cloudinary

import { Router } from "express";
import {
  createPost,
  getAllMyPosts,
  getPostsByUsername,
  updatePost,
  deletePost,
} from "./post.controller.js";
import { verifyJWT } from "../Middleware/auth.middleware.js";
import { upload } from "../Middleware/multer.middleware.js";

const router = Router();

// ── Public ──────────────────────────────────────────────────────────────
router.get("/public/:username", getPostsByUsername);

// ── Protected ───────────────────────────────────────────────────────────
router.post(
  "/",
  verifyJWT,
  upload.single("image"), // multer picks up the file field named "image"
  createPost
);
router.get("/", verifyJWT, getAllMyPosts);
router.patch("/:postId", verifyJWT, updatePost);
router.delete("/:postId", verifyJWT, deletePost);

export default router;
