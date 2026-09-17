module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  const hasKey = !!(process.env.OPENAI_API_KEY || process.env.AI_API_KEY);
  res.status(200).json({
    ok: true,
    service: 'AI Automator Pro',
    version: '1.4.0',
    features: {
      auth: true,
      stripe: !!process.env.STRIPE_SECRET_KEY,
      wixVerify: !!(process.env.WIX_APP_SECRET || process.env.APP_SECRET),
      redis: !!(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN),
      llm: hasKey,
    },
    time: new Date().toISOString(),
  });
};
