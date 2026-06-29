function parsePagination(query) {
  const page = Math.max(1, parseInt(query.page || '1', 10));
  const limit = Math.min(100, Math.max(1, parseInt(query.limit || '20', 10)));
  return { page, limit, skip: (page - 1) * limit };
}
function buildMeta(total, page, limit) {
  return { total, page, limit, totalPages: Math.ceil(total / limit) || 1 };
}
module.exports = { parsePagination, buildMeta };
