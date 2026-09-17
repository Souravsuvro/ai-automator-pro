const crypto = require('crypto');
const { b64urlDecode } = require('./crypto');
function getAppSecret() {
  return process.env.WIX_APP_SECRET || process.env.APP_SECRET || '';
}
function parseAndVerifyInstance(instance) {
  if (!instance || typeof instance !== 'string' || !instance.includes('.')) {
    return { ok: false, error: 'Invalid instance format' };
  }
  const secret = getAppSecret();
  const [sigPart, dataPart] = instance.split('.');
  if (!sigPart || !dataPart) return { ok: false, error: 'Malformed instance' };
  if (!secret) {
    try {
      const json = JSON.parse(b64urlDecode(dataPart).toString('utf8'));
      return { ok: true, verified: false, warning: 'WIX_APP_SECRET not set — signature not verified', data: json };
    } catch (e) {
      return { ok: false, error: 'Failed to decode instance payload' };
    }
  }
  const expected = crypto.createHmac('sha256', secret).update(dataPart).digest();
  let provided;
  try { provided = b64urlDecode(sigPart); } catch (e) { return { ok: false, error: 'Invalid signature encoding' }; }
  if (provided.length !== expected.length || !crypto.timingSafeEqual(provided, expected)) {
    return { ok: false, error: 'Signature verification failed' };
  }
  try {
    const data = JSON.parse(b64urlDecode(dataPart).toString('utf8'));
    return { ok: true, verified: true, data: data };
  } catch (e) {
    return { ok: false, error: 'Invalid JSON payload' };
  }
}
module.exports = { parseAndVerifyInstance, getAppSecret };
