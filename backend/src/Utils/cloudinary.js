// ─── Utility: Cloudinary ───────────────────────────────────────────────────
// Provides two helper functions:
//   uploadOnCloudinary(localFilePath) — uploads a file from the local disk
//     to Cloudinary, then removes the temp file regardless of success/failure.
//   deleteFromCloudinary(publicId, resourceType) — removes an asset from
//     Cloudinary using its public_id (stored in the DB when the file was uploaded).

import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

// Configure Cloudinary using environment variables (filled in .env)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Upload a local file to Cloudinary.
 * @param {string} localFilePath - Absolute path to the temp file on disk.
 * @returns {object|null} Cloudinary upload response or null on failure.
 */
const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;

    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
      folder: "artisans_canvas",
    });

    // File uploaded successfully — remove the local temp copy
    fs.unlinkSync(localFilePath);
    return response;
  } catch (error) {
    // Even on failure, attempt to clean up the temp file so disk doesn't fill
    if (fs.existsSync(localFilePath)) {
      fs.unlinkSync(localFilePath);
    }
    console.error("Cloudinary upload error:", error.message);
    return null;
  }
};

/**
 * Delete an asset from Cloudinary by its public_id.
 * @param {string} publicId - The Cloudinary public_id stored in the database.
 * @param {string} resourceType - "image" (default) | "video" | "raw"
 */
const deleteFromCloudinary = async (publicId, resourceType = "image") => {
  try {
    if (!publicId) return null;
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
    });
    return result;
  } catch (error) {
    console.error("Cloudinary delete error:", error.message);
    return null;
  }
};

export { uploadOnCloudinary, deleteFromCloudinary };
