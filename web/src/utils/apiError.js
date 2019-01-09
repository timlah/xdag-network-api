class ApiError extends Error {
  constructor({ userMessage }, ...params) {
    // Pass remaining arguments (including vendor specific ones) to parent constructor
    super(...params);

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ApiError);
    }

    // Custom debugging information
    this.userMessage = userMessage;
  }
}

module.exports = ApiError;
