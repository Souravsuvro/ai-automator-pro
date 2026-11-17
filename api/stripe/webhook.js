const { getUser, saveUser, claimStripeEvent, markStripeEventProcessed, releaseStripeEvent } = require('../_lib/store');
const { planFromPriceId, constructWebhookEvent } = require('../_lib/stripe');

async function readRawBody(req) {
  if (Buffer.isBuffer(req.body)) return req.body.toString('utf8');
  if (typeof req.body === 'string') return req.body;
  if (req.rawBody && Buffer.isBuffer(req.rawBody)) return req.rawBody.toString('utf8');
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', (chunk) => chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)));
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    req.on('error', reject);
  });
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  let claimedEventId = null;
  try {
    if (!process.env.STRIPE_WEBHOOK_SECRET) {
      return res.status(503).json({ error: 'Stripe webhook signature verification is not configured' });
    }
    const rawBody = await readRawBody(req);
    if (!rawBody) return res.status(400).json({ error: 'Empty webhook body' });
    const event = constructWebhookEvent(rawBody, req.headers['stripe-signature']);
    if (!event || !event.id || !event.type) return res.status(400).json({ error: 'Invalid Stripe event envelope' });

    const claim = await claimStripeEvent(event.id);
    if (claim === 'processed') return res.status(200).json({ received: true, duplicate: true });
    if (claim !== 'claimed') return res.status(409).json({ error: 'Stripe event is already being processed; retry delivery' });
    claimedEventId = event.id;

    const type = event.type;
    const obj = event.data && event.data.object;
    if (type === 'checkout.session.completed' && obj) {
      if (obj.mode !== 'subscription' || !['paid', 'no_payment_required'].includes(obj.payment_status)) {
        await markStripeEventProcessed(event.id);
        return res.status(200).json({ received: true });
      }
      const userId = obj.client_reference_id || (obj.metadata && obj.metadata.userId);
      if (userId) {
        const user = await getUser(userId);
        if (user) {
          user.stripeCustomerId = obj.customer || user.stripeCustomerId;
          user.stripeSubscriptionId = obj.subscription || user.stripeSubscriptionId;
          user.tier = (obj.metadata && obj.metadata.plan) || 'pro';
          user.updatedAt = new Date().toISOString();
          await saveUser(user);
        }
      }
    }

    if ((type === 'customer.subscription.updated' || type === 'customer.subscription.deleted') && obj) {
      const userId = obj.metadata && obj.metadata.userId;
      const user = userId ? await getUser(userId) : null;
      if (user) {
        if (type === 'customer.subscription.deleted' || obj.status === 'canceled') {
          user.tier = 'free';
          user.stripeSubscriptionId = null;
        } else {
          const priceId = obj.items && obj.items.data && obj.items.data[0] && obj.items.data[0].price
            ? obj.items.data[0].price.id : null;
          user.tier = planFromPriceId(priceId);
          user.stripeSubscriptionId = obj.id;
        }
        user.updatedAt = new Date().toISOString();
        await saveUser(user);
      }
    }

    await markStripeEventProcessed(event.id);
    claimedEventId = null;
    return res.status(200).json({ received: true });
  } catch (e) {
    if (claimedEventId) {
      try { await releaseStripeEvent(claimedEventId); } catch (releaseError) { console.error('Failed to release Stripe event claim', releaseError); }
    }
    console.error(e);
    return res.status(500).json({ error: e.message || 'Webhook failed' });
  }
};

// Vercel must not parse the body before Stripe signature verification.
module.exports.config = { api: { bodyParser: false } };
