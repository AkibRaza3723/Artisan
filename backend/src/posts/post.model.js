// ─── Model: Post ───────────────────────────────────────────────────────────
// Represents a single artwork post uploaded by a student.
// Each post belongs to exactly one User (owner) via a reference.
// imagePublicId is stored alongside the URL so the file can be deleted
// from Cloudinary when the post is removed.

import mongoose, { Schema } from "mongoose";

const postSchema = new Schema(
  {
    title: {
      type: String,
      required: [true, "Post title is required"],
      trim: true,
      maxlength: 120,
    },
    caption: {
      type: String,
      trim: true,
      maxlength: 300,
      default: "",
    },
    imageUrl: {
      type: String,
      required: [true, "Image URL is required"], // Set after Cloudinary upload
    },
    imagePublicId: {
      type: String,
      required: true, // Cloudinary public_id — used for deletion
    },
    tags: [{ type: String, trim: true }],
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true, // Indexed for fast "all posts by user" queries
    },
  },
  { timestamps: true }
);

export const Post = mongoose.model("Post", postSchema);
