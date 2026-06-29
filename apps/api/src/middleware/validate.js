// validate({ body, query, params }) — runs zod schemas, replaces req.* with parsed values.
const validate = (schemas) => (req, res, next) => {
  try {
    if (schemas.body) req.body = schemas.body.parse(req.body);
    if (schemas.query) req.query = schemas.query.parse(req.query);
    if (schemas.params) req.params = schemas.params.parse(req.params);
    next();
  } catch (e) {
    next(e);
  }
};
module.exports = { validate };
