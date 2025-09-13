class CustomError extends Error {
  constructor(message, statusCode ,name ) {
    super(message);
    this.statusCode = statusCode || 400;
    this.name = name || "CustomError";
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = CustomError;