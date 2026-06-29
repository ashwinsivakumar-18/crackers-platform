// Minimal logger (no deps). Swap for pino/winston later if desired.
const ts = () => new Date().toISOString();
const logger = {
  info: (...a) => console.log(ts(), '[info]', ...a),
  warn: (...a) => console.warn(ts(), '[warn]', ...a),
  error: (...a) => console.error(ts(), '[error]', ...a),
  debug: (...a) => process.env.NODE_ENV !== 'production' && console.log(ts(), '[debug]', ...a),
};
module.exports = { logger };
