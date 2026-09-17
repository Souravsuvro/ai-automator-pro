const { cors, verifyJwt, getBearer } = require('../_lib/crypto');
const { getUser } = require('../_lib/store');
const { createPortalSession } = require('../_lib/stripe');
module.exports = async function handler(req, res) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const token = getBearer(req);
    const payload = verifyJwt(token);
    if (!payload) return res.status(401).json({ error: 'Sign in required' });
    const user = await getUser(payload.sub);
    if (!user || !user.stripeCustomerId) return res.status(400).json({ error: 'No Stripe customer — subscribe first' });
    const origin = process.env.APP_URL || ('https://' + (req.headers.host || 'ai-automator-pro.vercel.app'));
    const session = await createPortalSession({ customerId: user.stripeCustomerId, returnUrl: origin + '/?billing=portal' });
    return res.status(200).json({ url: session.url });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: e.message || 'Portal failed' });
  }
};
