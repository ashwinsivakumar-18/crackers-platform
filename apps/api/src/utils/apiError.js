class ApiError extends Error {
  constructor(status, message, code) {
    super(message);
    this.status = status;
    this.code = code;
  }
  static badRequest(m, c) { return new ApiError(400, m, c); }
  static unauthorized(m = 'Unauthorized', c) { return new ApiError(401, m, c); }
  static forbidden(m = 'Forbidden', c) { return new ApiError(403, m, c); }
  static notFound(m = 'Not found', c) { return new ApiError(404, m, c); }
  static conflict(m, c) { return new ApiError(409, m, c); }
}
module.exports = { ApiError };
