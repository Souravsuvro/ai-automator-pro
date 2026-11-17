function getSecret() { return process.env.STRIPE_SECRET_KEY || ''; }
function getPriceId(plan) {
  if (plan === 'business') return process.env.STRIPE_PRICE_BUSINESS || '';
  if (plan === 'pro') return process.env.STRIPE_PRICE_PRO || '';
  return '';
}
function planFromPriceId(priceId) {
  if (!priceId) return 'free';
  if (priceId === process.env.STRIPE_PRICE_BUSINESS) return 'business';
  if (priceId === process.env.STRIPE_PRICE_PRO) return 'pro';
  return 'free';
}
async function stripeFetch(path, options) {
  options = options || {};
  const key = getSecret();
  if (!key) throw new Error('STRIPE_SECRET_KEY not configured');
  const res = await fetch('https://api.stripe.com/v1' + path, {
    method: options.method || 'POST',
    headers: Object.assign({ Authorization: 'Bearer ' + key, 'Content-Type': 'application/x-www-form-urlencoded' }, options.headers || {}),
    body: options.body,
  });
  const data = await res.json();
  if (!res.ok) throw new Error((data.error && data.error.message) || 'Stripe error ' + res.status);
  return data;
}
function formBody(obj, prefix) {
  prefix = prefix || '';
  const parts = [];
  for (const k of Object.keys(obj)) {
    const v = obj[k];
    const key = prefix ? prefix + '[' + k + ']' : k;
    if (v === undefined || v === null) continue;
    if (typeof v === 'object' && !Array.isArray(v)) parts.push(formBody(v, key));
    else parts.push(encodeURIComponent(key) + '=' + encodeURIComponent(String(v)));
  }
  return parts.filter(Boolean).join('&');
}
async function createCheckoutSession(opts) {
  const body = formBody({
    mode: 'subscription',
    success_url: opts.successUrl,
    cancel_url: opts.cancelUrl,
    line_items: [{ price: opts.priceId, quantity: 1 }],
    allow_promotion_codes: 'true',
    client_reference_id: opts.clientReferenceId || undefined,
    metadata: opts.metadata || undefined,
    subscription_data: opts.metadata ? { metadata: opts.metadata } : undefined,
  });
  let final = body;
  if (opts.customerId) final += '&customer=' + encodeURIComponent(opts.customerId);
  else if (opts.email) final += '&customer_email=' + encodeURIComponent(opts.email);
  return stripeFetch('/checkout/sessions', { body: final });
}
async function createPortalSession(opts) {
  return stripeFetch('/billing_portal/sessions', { body: formBody({ customer: opts.customerId, return_url: opts.returnUrl }) });
}
function constructWebhookEvent(rawBody, signature) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) throw new Error('STRIPE_WEBHOOK_SECRET not set');
  const crypto = require('crypto');
  let timestamp = null;
  const signatures = [];
  (signature || '').split(',').forEach(function (part) {
    const separator = part.indexOf('=');
    if (separator < 0) return;
    const key = part.slice(0, separator).trim();
    const value = part.slice(separator + 1).trim();
    if (key === 't') timestamp = value;
    if (key === 'v1') signatures.push(value);
  });
  if (!timestamp || !/^\d+$/.test(timestamp) || signatures.length === 0) {
    throw new Error('Invalid Stripe-Signature');
  }
  const expected = crypto.createHmac('sha256', secret).update(timestamp + '.' + rawBody, 'utf8').digest();
  const valid = signatures.some(function (candidate) {
    if (!/^[a-f0-9]{64}$/i.test(candidate)) return false;
    const supplied = Buffer.from(candidate, 'hex');
    return supplied.length === expected.length && crypto.timingSafeEqual(expected, supplied);
  });
  if (!valid) throw new Error('Webhook signature mismatch');
  if (Math.abs(Date.now() / 1000 - Number(timestamp)) > 300) throw new Error('Webhook timestamp too old');
  return JSON.parse(rawBody);
}
module.exports = { getSecret, getPriceId, planFromPriceId, stripeFetch, formBody, createCheckoutSession, createPortalSession, constructWebhookEvent };
