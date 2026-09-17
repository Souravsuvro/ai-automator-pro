const { cors, verifyPassword, signJwt } = require('../_lib/crypto');
const { getUserByEmail, saveUser } = require('../_lib/store');
const { parseAndVerifyInstance } = require('../_lib/wix');
module.exports = async function handler(req, res) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const { email, password, wixInstance } = req.body || {};
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' });
    const user = await getUserByEmail(email);
    if (!user || !verifyPassword(password, user.passwordHash)) return res.status(401).json({ error: 'Invalid credentials' });
    if (wixInstance) {
      const parsed = parseAndVerifyInstance(wixInstance);
      if (parsed.ok && parsed.data.instanceId) {
        user.wixInstanceId = parsed.data.instanceId;
        user.wixMeta = { verified: !!parsed.verified, siteOwnerId: parsed.data.siteOwnerId, uid: parsed.data.uid };
        await saveUser(user);
      }
    }
    const token = signJwt({ sub: user.id, email: user.email, tier: user.tier || 'free', wixInstanceId: user.wixInstanceId || null });
    return res.status(200).json({ token: token, user: { id: user.id, email: user.email, name: user.name, tier: user.tier || 'free', wixInstanceId: user.wixInstanceId || null } });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: e.message || 'Login failed' });
  }
};
