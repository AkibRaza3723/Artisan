// ─── Middleware: multer ─────────────────────────────────────────────────────
// Configures multer to store incoming file uploads in /public/temp/ on disk.
// The file is later picked up by the Cloudinary utility and deleted after upload.
// Only images are accepted (jpeg, jpg, png, webp, gif).

import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";

// Resolve __dirname in an ES Module context
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const storage = multer.diskStorage({
  // Save files to /public/temp relative to the project root (two levels up)
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "../../public/temp"));
  },

  // Preserve the original file extension while giving it a unique name
  filename: function (req, file, cb) {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  },
});

// File filter — only allow image MIME types
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|webp|gif/;
  const mimeOk = allowedTypes.test(file.mimetype);
  const extOk = allowedTypes.test(path.extname(file.originalname).toLowerCase());

  if (mimeOk && extOk) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed (jpeg, jpg, png, webp, gif)"));
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB max
});
