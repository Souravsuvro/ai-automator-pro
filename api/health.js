module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  const hasKey = !!(process.env.OPENAI_API_KEY || process.env.AI_API_KEY);
  res.status(200).json({
    ok: true,
    service: 'AI Automator Pro',
    llmConfigured: hasKey,
    engine: hasKey ? 'llm+template-fallback' : 'template',
    time: new Date().toISOString(),
  });
};
