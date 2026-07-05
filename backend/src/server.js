// ─── Server Entry Point ─────────────────────────────────────────────────────
// 1. Loads environment variables from .env  ← MUST happen first
// 2. Connects to MongoDB
// 3. Starts the HTTP server on the configured PORT
//
// NOTE: dotenv.config() is called synchronously at module evaluation time.
// PORT is read inside the async IIFE — after dotenv has populated process.env —
// to avoid any hoisting timing issues.

import "dotenv/config";
import connectDB from "./DB/index.js";
import { app } from "./app.js";

(async () => {
  try {
    await connectDB();

    // Read PORT after dotenv has populated process.env
    const PORT = process.env.PORT || 8000;

    app.on("error", (error) => {
      console.error("❌  Express app error:", error);
      throw error;
    });

    app.listen(PORT, () => {
      console.log(`🚀  Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("❌  Server failed to start:", error);
    process.exit(1);
  }
})();
