const { cors } = require('../_lib/crypto');
const { parseAndVerifyInstance } = require('../_lib/wix');
module.exports = async function handler(req, res) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const { instance } = req.body || {};
    if (!instance) return res.status(400).json({ error: 'instance required' });
    const result = parseAndVerifyInstance(instance);
    if (!result.ok) return res.status(401).json({ error: result.error });
    return res.status(200).json({
      verified: !!result.verified,
      warning: result.warning || null,
      instanceId: result.data.instanceId,
      siteOwnerId: result.data.siteOwnerId,
      uid: result.data.uid,
      demoMode: result.data.demoMode,
      permissions: result.data.permissions,
      signDate: result.data.signDate,
    });
  } catch (e) {
    return res.status(500).json({ error: e.message || 'Verify failed' });
  }
};
