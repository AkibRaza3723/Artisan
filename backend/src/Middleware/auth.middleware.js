// ─── Middleware: JWT Authentication ────────────────────────────────────────
// Verifies the JWT access token present in either:
//   1. The Authorization header  →  "Bearer <token>"
//   2. An httpOnly cookie        →  "accessToken"
//
// On success: attaches the decoded user payload to req.user and calls next().
// On failure: throws ApiError(401) which Express forwards to the error handler.

import jwt from "jsonwebtoken";
import { ApiError } from "../Utils/ApiError.js";
import { asyncHandler } from "../Utils/asyncHandler.js";
import { User } from "../User/user.model.js";

export const verifyJWT = asyncHandler(async (req, res, next) => {
  // 1. Extract token from header or cookie
  const token =
    req.cookies?.accessToken ||
    req.header("Authorization")?.replace("Bearer ", "").trim();

  if (!token) {
    throw new ApiError(401, "Unauthorized request — no token provided");
  }

  // 2. Verify the token signature and expiry
  let decodedToken;
  try {
    decodedToken = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    throw new ApiError(401, "Invalid or expired access token");
  }

  // 3. Confirm the user still exists in the DB
  const user = await User.findById(decodedToken?._id).select(
    "-password -refreshToken"
  );

  if (!user) {
    throw new ApiError(401, "Invalid access token — user not found");
  }

  req.user = user;
  next();
});
