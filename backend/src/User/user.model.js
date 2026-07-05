// ─── Model: User ───────────────────────────────────────────────────────────
// Represents an art student account. Stores auth credentials, profile data,
// education history, experience, and contact info.
// The "username" field acts as a URL-safe slug for the public portfolio link.

import mongoose, { Schema } from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const educationSchema = new Schema(
  {
    institution: { type: String, required: true, trim: true },
    degree: { type: String, required: true, trim: true },
    fieldOfStudy: { type: String, trim: true },
    startYear: { type: Number },
    endYear: { type: Number },
    current: { type: Boolean, default: false },
  },
  { _id: false }
);

const experienceSchema = new Schema(
  {
    role: { type: String, required: true, trim: true },
    organisation: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    startYear: { type: Number },
    endYear: { type: Number },
    current: { type: Boolean, default: false },
  },
  { _id: false }
);

const contactInfoSchema = new Schema(
  {
    email: { type: String, trim: true },
    phone: { type: String, trim: true },
    instagram: { type: String, trim: true },
    twitter: { type: String, trim: true },
    linkedin: { type: String, trim: true },
    website: { type: String, trim: true },
  },
  { _id: false }
);

const userSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true, // Indexed for fast portfolio slug lookups
      match: [/^[a-z0-9_-]+$/, "Username can only contain letters, numbers, hyphens, and underscores"],
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 8,
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    bio: {
      type: String,
      maxlength: 500,
      default: "",
    },
    avatar: {
      type: String, // Cloudinary URL
      default: "",
    },
    avatarPublicId: {
      type: String, // Cloudinary public_id (needed for deletion/replacement)
      default: "",
    },
    visionStatement: {
      type: String,
      maxlength: 300,
      default: "",
    },
    education: [educationSchema],
    experience: [experienceSchema],
    contactInfo: { type: contactInfoSchema, default: {} },
    refreshToken: {
      type: String,
    },
  },
  { timestamps: true }
);

// ── Hooks ─────────────────────────────────────────────────────────────────

// Hash password before saving — only if it was modified
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 12);
});

// ── Methods ───────────────────────────────────────────────────────────────

// Compare a plain-text candidate password with the stored hash
userSchema.methods.isPasswordCorrect = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Generate a short-lived JWT access token
userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
      username: this.username,
      fullName: this.fullName,
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRY || "1d" }
  );
};

// Generate a long-lived refresh token (stored in DB for rotation)
userSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    { _id: this._id },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRY || "10d" }
  );
};

export const User = mongoose.model("User", userSchema);
