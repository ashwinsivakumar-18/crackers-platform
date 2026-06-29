const { env } = require('../../config/env');
const { logger } = require('../../lib/logger');

const fmtTo = (m) => { const d = String(m).replace(/\D/g, ''); return d.length === 10 ? `91${d}` : d; };

async function sendWhatsApp(to, message) {
  if (!env.whatsapp.url || !env.whatsapp.token) {
    logger.debug('[whatsapp] not configured — would send:', to, message);
    return { ok: true, providerId: 'log' };
  }
  try {
    const res = await fetch(env.whatsapp.url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${env.whatsapp.token}` },
      body: JSON.stringify({ messaging_product: 'whatsapp', to: fmtTo(to), type: 'text', text: { body: message } }),
    });
    if (!res.ok) { logger.warn('[whatsapp] failed', res.status); return { ok: false }; }
    return { ok: true };
  } catch (e) { logger.error('[whatsapp]', e.message); return { ok: false }; }
}
async function sendEmail(to, subject, body) { logger.debug('[email] would send', to, subject); return { ok: true }; }
async function sendPush(tokens, title, body) { logger.debug('[push] would send', title); return { ok: true }; }

module.exports = { sendWhatsApp, sendEmail, sendPush };
