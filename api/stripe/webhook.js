const { getUser, saveUser } = require('../_lib/store');
const { planFromPriceId, constructWebhookEvent } = require('../_lib/stripe');
module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const rawBody = typeof req.body === 'string' ? req.body : JSON.stringify(req.body || {});
    let event;
    try {
      event = constructWebhookEvent(typeof req.body === 'string' ? req.body : rawBody, req.headers['stripe-signature']);
    } catch (sigErr) {
      if (!process.env.STRIPE_WEBHOOK_SECRET) {
        event = typeof req.body === 'object' ? req.body : JSON.parse(rawBody);
      } else {
        return res.status(400).json({ error: sigErr.message });
      }
    }
    const type = event.type;
    const obj = event.data && event.data.object;
    if (type === 'checkout.session.completed' && obj) {
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
          const priceId = obj.items && obj.items.data && obj.items.data[0] && obj.items.data[0].price ? obj.items.data[0].price.id : null;
          user.tier = planFromPriceId(priceId);
          user.stripeSubscriptionId = obj.id;
        }
        user.updatedAt = new Date().toISOString();
        await saveUser(user);
      }
    }
    return res.status(200).json({ received: true });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: e.message || 'Webhook failed' });
  }
};
