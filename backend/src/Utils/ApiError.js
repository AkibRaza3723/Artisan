// ─── Utility: ApiError ─────────────────────────────────────────────────────
// A custom Error class that standardises error shape across the entire API.
// statusCode  → HTTP status code to send back to the client
// message     → human-readable error description
// errors      → optional array of granular validation / field errors
// stack       → automatically captured from Node.js Error

class ApiError extends Error {
  constructor(
    statusCode,
    message = "Something went wrong",
    errors = [],
    stack = ""
  ) {
    super(message);
    this.statusCode = statusCode;
    this.data = null;
    this.message = message;
    this.success = false;
    this.errors = errors;

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

export { ApiError };
