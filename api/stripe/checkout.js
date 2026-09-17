const { cors, verifyJwt, getBearer } = require('../_lib/crypto');
const { getUser, saveUser } = require('../_lib/store');
const { getPriceId, createCheckoutSession } = require('../_lib/stripe');
module.exports = async function handler(req, res) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const token = getBearer(req);
    const payload = verifyJwt(token);
    if (!payload) return res.status(401).json({ error: 'Sign in required' });
    const user = await getUser(payload.sub);
    if (!user) return res.status(401).json({ error: 'User not found' });
    const { plan } = req.body || {};
    const priceId = getPriceId(plan === 'business' ? 'business' : 'pro');
    if (!priceId) return res.status(503).json({ error: 'Stripe prices not configured. Set STRIPE_PRICE_PRO and STRIPE_PRICE_BUSINESS.' });
    const origin = process.env.APP_URL || ('https://' + (req.headers.host || 'ai-automator-pro.vercel.app'));
    const session = await createCheckoutSession({
      customerId: user.stripeCustomerId || undefined,
      email: user.email,
      priceId: priceId,
      successUrl: origin + '/?billing=success&session_id={CHECKOUT_SESSION_ID}',
      cancelUrl: origin + '/?billing=cancel',
      clientReferenceId: user.id,
      metadata: { userId: user.id, plan: plan === 'business' ? 'business' : 'pro', wixInstanceId: user.wixInstanceId || '' },
    });
    if (session.customer && !user.stripeCustomerId) {
      user.stripeCustomerId = session.customer;
      await saveUser(user);
    }
    return res.status(200).json({ url: session.url, sessionId: session.id });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: e.message || 'Checkout failed' });
  }
};
