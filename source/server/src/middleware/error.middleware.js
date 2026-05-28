export const notFound = (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.originalUrl}`,
  });
};

export const errorHandler = (err, req, res, next) => {
  if (res.headersSent) return next(err);

  const statusCode = err.statusCode || err.status || 500;
  const message =
    statusCode === 500 ? "Internal Server Error" : err.message || "Request failed";

  if (statusCode === 500) {
    console.error("Unhandled server error:", err);
  }

  res.status(statusCode).json({
    success: false,
    message,
  });
};

