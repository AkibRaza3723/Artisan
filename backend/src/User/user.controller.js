// ─── Controller: User ──────────────────────────────────────────────────────
// Handles all user-facing operations:
//   registerUser   — create account
//   loginUser      — verify credentials, issue JWT tokens
//   logoutUser     — clear refresh token from DB and cookie
//   refreshAccessToken — rotate tokens using refresh token
//   getCurrentUser — return the authenticated user's profile
//   updateProfile  — update bio, vision, contact, education, experience
//   updateAvatar   — replace avatar image via Cloudinary

import { asyncHandler } from "../Utils/asyncHandler.js";
import { ApiError } from "../Utils/ApiError.js";
import { ApiResponse } from "../Utils/ApiResponse.js";
import { User } from "./user.model.js";
import { uploadOnCloudinary, deleteFromCloudinary } from "../Utils/cloudinary.js";
import jwt from "jsonwebtoken";

// ── Cookie options (shared) ─────────────────────────────────────────────
const cookieOptions = {
  httpOnly: true,  // Not accessible via document.cookie
  secure: process.env.NODE_ENV === "production",
  sameSite: "Strict",
};

// ── Helper: generate both tokens and save refresh token to DB ───────────
const generateTokens = async (userId) => {
  const user = await User.findById(userId);
  const accessToken = user.generateAccessToken();
  const refreshToken = user.generateRefreshToken();

  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false }); // Skip full validation for token update

  return { accessToken, refreshToken };
};

// ── Register ─────────────────────────────────────────────────────────────
const registerUser = asyncHandler(async (req, res) => {
  const { username, email, password, fullName } = req.body;

  // 1. Validate required fields
  if ([username, email, password, fullName].some((f) => !f?.trim())) {
    throw new ApiError(400, "All fields are required");
  }

  // 2. Check for existing user
  const existingUser = await User.findOne({ $or: [{ username }, { email }] });
  if (existingUser) {
    throw new ApiError(409, "Username or email is already taken");
  }

  // 3. Create user (password is hashed by pre-save hook in model)
  const user = await User.create({
    username: username.toLowerCase().trim(),
    email: email.toLowerCase().trim(),
    password,
    fullName: fullName.trim(),
  });

  // 4. Return user without sensitive fields
  const createdUser = await User.findById(user._id).select("-password -refreshToken");

  if (!createdUser) {
    throw new ApiError(500, "User creation failed — please try again");
  }

  return res
    .status(201)
    .json(new ApiResponse(201, createdUser, "Account created successfully"));
});

// ── Login ────────────────────────────────────────────────────────────────
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ApiError(400, "Email and password are required");
  }

  const user = await User.findOne({ email: email.toLowerCase().trim() });
  if (!user) {
    throw new ApiError(404, "No account found with this email");
  }

  const isMatch = await user.isPasswordCorrect(password);
  if (!isMatch) {
    throw new ApiError(401, "Incorrect password");
  }

  const { accessToken, refreshToken } = await generateTokens(user._id);

  const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

  return res
    .status(200)
    .cookie("accessToken", accessToken, cookieOptions)
    .cookie("refreshToken", refreshToken, cookieOptions)
    .json(
      new ApiResponse(200, { user: loggedInUser, accessToken, refreshToken }, "Login successful")
    );
});

// ── Logout ───────────────────────────────────────────────────────────────
const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    { $unset: { refreshToken: 1 } },
    { returnDocument: "after" }
  );

  return res
    .status(200)
    .clearCookie("accessToken", cookieOptions)
    .clearCookie("refreshToken", cookieOptions)
    .json(new ApiResponse(200, {}, "Logged out successfully"));
});

// ── Refresh Access Token ─────────────────────────────────────────────────
const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies?.refreshToken || req.body?.refreshToken;

  if (!incomingRefreshToken) {
    throw new ApiError(401, "No refresh token provided");
  }

  let decoded;
  try {
    decoded = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);
  } catch {
    throw new ApiError(401, "Invalid or expired refresh token");
  }

  const user = await User.findById(decoded._id);
  if (!user || user.refreshToken !== incomingRefreshToken) {
    throw new ApiError(401, "Refresh token mismatch — please login again");
  }

  const { accessToken, refreshToken: newRefreshToken } = await generateTokens(user._id);

  return res
    .status(200)
    .cookie("accessToken", accessToken, cookieOptions)
    .cookie("refreshToken", newRefreshToken, cookieOptions)
    .json(new ApiResponse(200, { accessToken, refreshToken: newRefreshToken }, "Tokens refreshed"));
});

// ── Get Current User ─────────────────────────────────────────────────────
const getCurrentUser = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(new ApiResponse(200, req.user, "Current user fetched"));
});

// ── Update Profile ───────────────────────────────────────────────────────
const updateProfile = asyncHandler(async (req, res) => {
  const { fullName, bio, visionStatement, contactInfo, education, experience } = req.body;

  // Helper: Filter out completely blank entries (so Mongoose required validation doesn't
  // trigger on default blank rows) and sanitize year fields.
  const sanitizeEducation = (arr) =>
    arr
      ?.filter((entry) =>
        entry.institution?.trim() ||
        entry.degree?.trim() ||
        entry.fieldOfStudy?.trim() ||
        entry.startYear ||
        entry.endYear
      )
      ?.map((entry) => ({
        ...entry,
        startYear: entry.startYear !== "" && entry.startYear !== undefined
          ? Number(entry.startYear) || undefined
          : undefined,
        endYear: entry.current
          ? undefined
          : (entry.endYear !== "" && entry.endYear !== undefined
              ? Number(entry.endYear) || undefined
              : undefined),
      }));

  const sanitizeExperience = (arr) =>
    arr
      ?.filter((entry) =>
        entry.role?.trim() ||
        entry.organisation?.trim() ||
        entry.description?.trim() ||
        entry.startYear ||
        entry.endYear
      )
      ?.map((entry) => ({
        ...entry,
        startYear: entry.startYear !== "" && entry.startYear !== undefined
          ? Number(entry.startYear) || undefined
          : undefined,
        endYear: entry.current
          ? undefined
          : (entry.endYear !== "" && entry.endYear !== undefined
              ? Number(entry.endYear) || undefined
              : undefined),
      }));

  const updatedFields = {};
  if (fullName !== undefined) updatedFields.fullName = fullName.trim();
  if (bio !== undefined) updatedFields.bio = bio;
  if (visionStatement !== undefined) updatedFields.visionStatement = visionStatement;
  if (contactInfo !== undefined) updatedFields.contactInfo = contactInfo;
  if (education !== undefined) updatedFields.education = sanitizeEducation(education);
  if (experience !== undefined) updatedFields.experience = sanitizeExperience(experience);

  const user = await User.findByIdAndUpdate(
    req.user._id,
    { $set: updatedFields },
    { returnDocument: "after", runValidators: true }
  ).select("-password -refreshToken");

  return res
    .status(200)
    .json(new ApiResponse(200, user, "Profile updated successfully"));
});

// ── Update Avatar ─────────────────────────────────────────────────────────
const updateAvatar = asyncHandler(async (req, res) => {
  const localFilePath = req.file?.path;
  if (!localFilePath) {
    throw new ApiError(400, "Avatar image file is required");
  }

  // 1. Upload new avatar first to avoid deleting old one if upload fails
  const uploaded = await uploadOnCloudinary(localFilePath);
  if (!uploaded?.url) {
    throw new ApiError(500, "Avatar upload failed — please try again");
  }

  // 2. Delete old avatar from Cloudinary if one exists
  const currentUser = await User.findById(req.user._id);
  if (currentUser.avatarPublicId) {
    await deleteFromCloudinary(currentUser.avatarPublicId);
  }

  // 3. Update database reference
  const user = await User.findByIdAndUpdate(
    req.user._id,
    { $set: { avatar: uploaded.url, avatarPublicId: uploaded.public_id } },
    { returnDocument: "after" }
  ).select("-password -refreshToken");

  return res
    .status(200)
    .json(new ApiResponse(200, user, "Avatar updated successfully"));
});

// ── Get Public Profile (no auth) ──────────────────────────────────────────
const getPublicProfile = asyncHandler(async (req, res) => {
  const { username } = req.params;

  const user = await User.findOne({ username: username.toLowerCase() }).select(
    "-password -refreshToken -email -avatarPublicId"
  );

  if (!user) {
    throw new ApiError(404, `No portfolio found for username: ${username}`);
  }

  return res
    .status(200)
    .json(new ApiResponse(200, user, "Public profile fetched"));
});

export {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  getCurrentUser,
  updateProfile,
  updateAvatar,
  getPublicProfile,
};
