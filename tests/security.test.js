const test = require('node:test');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');

const authCrypto = require('../api/_lib/crypto');
const { b64url } = authCrypto;
const { parseAndVerifyInstance } = require('../api/_lib/wix');
const { constructWebhookEvent, planFromPriceId } = require('../api/_lib/stripe');
const store = require('../api/_lib/store');

test('JWT signing fails closed without a strong configured secret', () => {
  const previous = process.env.JWT_SECRET;
  delete process.env.JWT_SECRET;
  assert.throws(() => authCrypto.signJwt({ sub: 'user-1' }), /JWT_SECRET must be configured/);
  process.env.JWT_SECRET = 'short';
  assert.throws(() => authCrypto.signJwt({ sub: 'user-1' }), /at least 32 bytes/);
  process.env.JWT_SECRET = 'a'.repeat(48);
  const token = authCrypto.signJwt({ sub: 'user-1' });
  assert.equal(authCrypto.verifyJwt(token).sub, 'user-1');
  if (previous === undefined) delete process.env.JWT_SECRET;
  else process.env.JWT_SECRET = previous;
});

test('Wix instance verification rejects missing secrets and validates HMAC signatures', () => {
  const previous = process.env.WIX_APP_SECRET;
  delete process.env.WIX_APP_SECRET;
  const data = b64url(JSON.stringify({ instanceId: 'site-1' }));
  assert.equal(parseAndVerifyInstance('signature.' + data).ok, false);
  process.env.WIX_APP_SECRET = 'wix-test-secret';
  const signature = crypto.createHmac('sha256', process.env.WIX_APP_SECRET).update(data).digest('base64')
    .replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  const verified = parseAndVerifyInstance(signature + '.' + data);
  assert.equal(verified.ok, true);
  assert.equal(verified.verified, true);
  assert.equal(verified.data.instanceId, 'site-1');
  assert.equal(parseAndVerifyInstance('bad.' + data).ok, false);
  if (previous === undefined) delete process.env.WIX_APP_SECRET;
  else process.env.WIX_APP_SECRET = previous;
});

test('Stripe webhook signatures require a valid timestamp and matching HMAC', () => {
  const previous = process.env.STRIPE_WEBHOOK_SECRET;
  process.env.STRIPE_WEBHOOK_SECRET = 'stripe-test-secret';
  const raw = JSON.stringify({ id: 'evt_test_1', type: 'customer.subscription.updated', data: { object: {} } });
  const timestamp = String(Math.floor(Date.now() / 1000));
  const signature = crypto.createHmac('sha256', process.env.STRIPE_WEBHOOK_SECRET)
    .update(timestamp + '.' + raw, 'utf8').digest('hex');
  assert.equal(constructWebhookEvent(raw, 't=' + timestamp + ',v1=' + signature).id, 'evt_test_1');
  assert.throws(() => constructWebhookEvent(raw, 't=bad,v1=' + signature), /Invalid Stripe-Signature/);
  assert.throws(() => constructWebhookEvent(raw, 't=' + timestamp + ',v1=' + '0'.repeat(64)), /signature mismatch/);
  if (previous === undefined) delete process.env.STRIPE_WEBHOOK_SECRET;
  else process.env.STRIPE_WEBHOOK_SECRET = previous;
});

test('unknown Stripe price IDs never grant a paid tier', () => {
  const previousPro = process.env.STRIPE_PRICE_PRO;
  const previousBusiness = process.env.STRIPE_PRICE_BUSINESS;
  process.env.STRIPE_PRICE_PRO = 'price_pro_test';
  process.env.STRIPE_PRICE_BUSINESS = 'price_business_test';
  assert.equal(planFromPriceId('price_pro_test'), 'pro');
  assert.equal(planFromPriceId('price_business_test'), 'business');
  assert.equal(planFromPriceId('price_unrecognized'), 'free');
  if (previousPro === undefined) delete process.env.STRIPE_PRICE_PRO;
  else process.env.STRIPE_PRICE_PRO = previousPro;
  if (previousBusiness === undefined) delete process.env.STRIPE_PRICE_BUSINESS;
  else process.env.STRIPE_PRICE_BUSINESS = previousBusiness;
});

test('Stripe event claims distinguish new, in-flight, and processed events', async () => {
  const oldNodeEnv = process.env.NODE_ENV;
  const oldUrl = process.env.UPSTASH_REDIS_REST_URL;
  const oldToken = process.env.UPSTASH_REDIS_REST_TOKEN;
  process.env.NODE_ENV = 'test';
  delete process.env.UPSTASH_REDIS_REST_URL;
  delete process.env.UPSTASH_REDIS_REST_TOKEN;
  const id = 'evt_idempotency_test_' + crypto.randomBytes(8).toString('hex');
  assert.equal(await store.claimStripeEvent(id), 'claimed');
  assert.equal(await store.claimStripeEvent(id), 'processing');
  await store.markStripeEventProcessed(id);
  assert.equal(await store.claimStripeEvent(id), 'processed');
  await store.releaseStripeEvent(id);
  if (oldNodeEnv === undefined) delete process.env.NODE_ENV;
  else process.env.NODE_ENV = oldNodeEnv;
  if (oldUrl === undefined) delete process.env.UPSTASH_REDIS_REST_URL;
  else process.env.UPSTASH_REDIS_REST_URL = oldUrl;
  if (oldToken === undefined) delete process.env.UPSTASH_REDIS_REST_TOKEN;
  else process.env.UPSTASH_REDIS_REST_TOKEN = oldToken;
});
