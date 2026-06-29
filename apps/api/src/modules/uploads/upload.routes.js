const { Router } = require('express');
const multer = require('multer');
const { authenticate } = require('../../middleware/auth');
const { asyncHandler } = require('../../utils/asyncHandler');
const { ApiError } = require('../../utils/apiError');
const { putObject } = require('./storage');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_q, f, cb) => f.mimetype.startsWith('image/') ? cb(null, true) : cb(new Error('Images only')),
});

const r = Router();
r.post('/', authenticate, upload.single('file'), asyncHandler(async (req, res) => {
  if (!req.file) throw ApiError.badRequest('Attach an image in "file"');
  const prefix = typeof req.query.prefix === 'string' ? req.query.prefix : 'uploads';
  const stored = await putObject(req.file.buffer, req.file.mimetype, prefix);
  res.status(201).json(stored);
}));
module.exports = r;
