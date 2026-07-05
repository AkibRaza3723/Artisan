// ─── Utility: asyncHandler ─────────────────────────────────────────────────
// A higher-order function that wraps async route controllers so that any
// rejected promise or thrown error is forwarded to Express's next() error
// handler automatically — removing the need for try/catch in every controller.

const asyncHandler = (requestHandler) => {
  return (req, res, next) => {
    Promise.resolve(requestHandler(req, res, next)).catch((err) => next(err));
  };
};

export { asyncHandler };
