class ErrorResponse extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
  }
}

const createError = (status, message) => {
  return new ErrorResponse(message, status);
};

module.exports = {
  ErrorResponse,
  createError
}; 