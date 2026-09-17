const { cors, hashPassword, signJwt, randomId } = require('../_lib/crypto');
const { getUserByEmail, saveUser } = require('../_lib/store');
const { parseAndVerifyInstance } = require('../_lib/wix');
module.exports = async function handler(req, res) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const { email, password, name, wixInstance } = req.body || {};
    if (!email || !password || password.length < 8) return res.status(400).json({ error: 'Email and password (min 8 chars) required' });
    const existing = await getUserByEmail(email);
    if (existing) return res.status(409).json({ error: 'Account already exists' });
    let wixInstanceId = null, wixMeta = null;
    if (wixInstance) {
      const parsed = parseAndVerifyInstance(wixInstance);
      if (!parsed.ok) return res.status(400).json({ error: 'Invalid Wix instance: ' + parsed.error });
      wixInstanceId = parsed.data.instanceId || null;
      wixMeta = { verified: !!parsed.verified, siteOwnerId: parsed.data.siteOwnerId, uid: parsed.data.uid };
    }
    const user = {
      id: randomId(), email: email.toLowerCase().trim(), name: name || '',
      passwordHash: hashPassword(password), tier: 'free', wixInstanceId, wixMeta,
      stripeCustomerId: null, stripeSubscriptionId: null, createdAt: new Date().toISOString(),
    };
    await saveUser(user);
    const token = signJwt({ sub: user.id, email: user.email, tier: user.tier, wixInstanceId: user.wixInstanceId });
    return res.status(201).json({ token: token, user: { id: user.id, email: user.email, name: user.name, tier: user.tier, wixInstanceId: wixInstanceId } });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: e.message || 'Register failed' });
  }
};
