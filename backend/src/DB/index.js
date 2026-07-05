// ─── Database Connection ────────────────────────────────────────────────────
// Connects Mongoose to MongoDB Atlas (or local) using the URI from .env.
// DB_NAME is kept in constant.js to avoid hardcoding it here.

import mongoose from "mongoose";
import { DB_NAME } from "../constant.js";

const connectDB = async () => {
  try {
    const connectionInstance = await mongoose.connect(process.env.MONGODB_URI, {
      dbName: DB_NAME,
    });

    console.log(
      `\n✅  MongoDB connected! Host: ${connectionInstance.connection.host}`
    );
  } catch (error) {
    console.error("❌  MongoDB connection FAILED:", error.message);
    process.exit(1); // Non-zero exit causes nodemon/pm2 to restart
  }
};

export default connectDB;
