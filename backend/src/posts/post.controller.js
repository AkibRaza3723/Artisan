// ─── Controller: Posts ─────────────────────────────────────────────────────
// Handles all artwork post operations:
//   createPost      — upload image to Cloudinary, save post to DB
//   getAllMyPosts    — fetch the authenticated user's posts (paginated)
//   getPostsByUser  — fetch posts for a public portfolio page (no auth)
//   updatePost      — edit title/caption/tags of an existing post
//   deletePost      — remove post from DB and delete image from Cloudinary

import { asyncHandler } from "../Utils/asyncHandler.js";
import { ApiError } from "../Utils/ApiError.js";
import { ApiResponse } from "../Utils/ApiResponse.js";
import { Post } from "./post.model.js";
import { User } from "../User/user.model.js";
import { uploadOnCloudinary, deleteFromCloudinary } from "../Utils/cloudinary.js";

// ── Create Post ──────────────────────────────────────────────────────────
const createPost = asyncHandler(async (req, res) => {
  const { title, caption, tags } = req.body;
  const localFilePath = req.file?.path;

  if (!title?.trim()) {
    throw new ApiError(400, "Post title is required");
  }
  if (!localFilePath) {
    throw new ApiError(400, "Artwork image is required");
  }

  // Upload image to Cloudinary (temp file is auto-deleted inside the utility)
  const uploaded = await uploadOnCloudinary(localFilePath);
  if (!uploaded?.url) {
    throw new ApiError(500, "Image upload failed — please try again");
  }

  // Parse tags if sent as a JSON string (common with multipart forms)
  let parsedTags = [];
  if (tags) {
    try {
      const parsed = Array.isArray(tags) ? tags : JSON.parse(tags);
      parsedTags = Array.isArray(parsed) ? parsed : [parsed];
    } catch {
      parsedTags = tags.split(",").map((t) => t.trim()).filter(Boolean);
    }
  }
  parsedTags = parsedTags.map((t) => String(t).trim()).filter(Boolean);

  const post = await Post.create({
    title: title.trim(),
    caption: caption?.trim() || "",
    imageUrl: uploaded.url,
    imagePublicId: uploaded.public_id,
    tags: parsedTags,
    owner: req.user._id,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, post, "Artwork uploaded successfully"));
});

// ── Get All My Posts (paginated) ─────────────────────────────────────────
const getAllMyPosts = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.max(1, Math.min(100, parseInt(req.query.limit) || 12));
  const skip = (page - 1) * limit;

  const [posts, total] = await Promise.all([
    Post.find({ owner: req.user._id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Post.countDocuments({ owner: req.user._id }),
  ]);

  return res.status(200).json(
    new ApiResponse(200, {
      posts,
      pagination: { total, page, limit, pages: Math.ceil(total / limit) },
    }, "Posts fetched successfully")
  );
});

// ── Get Posts By Username (public, no auth) ───────────────────────────────
const getPostsByUsername = asyncHandler(async (req, res) => {
  const { username } = req.params;
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.max(1, Math.min(100, parseInt(req.query.limit) || 12));
  const skip = (page - 1) * limit;

  // Find the user by username to get their _id
  const user = await User.findOne({ username: username.toLowerCase() }).select("_id");
  if (!user) {
    throw new ApiError(404, `No artist found with username: ${username}`);
  }

  const [posts, total] = await Promise.all([
    Post.find({ owner: user._id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Post.countDocuments({ owner: user._id }),
  ]);

  return res.status(200).json(
    new ApiResponse(200, {
      posts,
      pagination: { total, page, limit, pages: Math.ceil(total / limit) },
    }, "Public posts fetched")
  );
});

// ── Update Post ──────────────────────────────────────────────────────────
const updatePost = asyncHandler(async (req, res) => {
  const { postId } = req.params;
  const { title, caption, tags } = req.body;

  const post = await Post.findById(postId);
  if (!post) {
    throw new ApiError(404, "Post not found");
  }

  // Ownership check — only the creator can edit their post
  if (post.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You are not allowed to edit this post");
  }

  const updatedFields = {};
  if (title !== undefined) updatedFields.title = title.trim();
  if (caption !== undefined) updatedFields.caption = caption.trim();
  if (tags !== undefined) {
    let parsedTags = [];
    try {
      const parsed = Array.isArray(tags) ? tags : JSON.parse(tags);
      parsedTags = Array.isArray(parsed) ? parsed : [parsed];
    } catch {
      parsedTags = String(tags).split(",").map((t) => t.trim()).filter(Boolean);
    }
    updatedFields.tags = parsedTags.map((t) => String(t).trim()).filter(Boolean);
  }

  const updated = await Post.findByIdAndUpdate(
    postId,
    { $set: updatedFields },
    { returnDocument: "after", runValidators: true }
  );

  return res
    .status(200)
    .json(new ApiResponse(200, updated, "Post updated successfully"));
});

// ── Delete Post ──────────────────────────────────────────────────────────
const deletePost = asyncHandler(async (req, res) => {
  const { postId } = req.params;

  const post = await Post.findById(postId);
  if (!post) {
    throw new ApiError(404, "Post not found");
  }

  // Ownership check
  if (post.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You are not allowed to delete this post");
  }

  // Delete the image from Cloudinary first
  await deleteFromCloudinary(post.imagePublicId);

  // Remove the document from DB
  await Post.findByIdAndDelete(postId);

  return res
    .status(200)
    .json(new ApiResponse(200, { postId }, "Post deleted successfully"));
});

export {
  createPost,
  getAllMyPosts,
  getPostsByUsername,
  updatePost,
  deletePost,
};
