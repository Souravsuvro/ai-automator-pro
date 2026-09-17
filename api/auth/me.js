const { cors, verifyJwt, getBearer } = require('../_lib/crypto');
const { getUser } = require('../_lib/store');
module.exports = async function handler(req, res) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const token = getBearer(req);
    const payload = verifyJwt(token);
    if (!payload) return res.status(401).json({ error: 'Unauthorized' });
    const user = await getUser(payload.sub);
    if (!user) return res.status(401).json({ error: 'User not found' });
    return res.status(200).json({ user: { id: user.id, email: user.email, name: user.name, tier: user.tier || 'free', wixInstanceId: user.wixInstanceId || null, stripeCustomerId: user.stripeCustomerId || null } });
  } catch (e) {
    return res.status(500).json({ error: e.message || 'Failed' });
  }
};
