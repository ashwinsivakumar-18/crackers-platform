const { ApiError } = require('../utils/apiError');
const { ZodError } = require('zod');
const { logger } = require('../lib/logger');

function notFound(req, res) {
  res.status(404).json({ error: { message: 'Route not found' } });
}

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  if (err instanceof ZodError) {
    return res.status(400).json({ error: { message: 'Validation failed', code: 'VALIDATION', issues: err.issues } });
  }
  if (err instanceof ApiError) {
    return res.status(err.status).json({ error: { message: err.message, code: err.code } });
  }
  if (err && err.code === 11000) { // Mongo duplicate key
    return res.status(409).json({ error: { message: 'Already exists', code: 'DUPLICATE' } });
  }
  logger.error(err.stack || err.message || err);
  res.status(500).json({ error: { message: 'Internal server error' } });
}
module.exports = { notFound, errorHandler };
