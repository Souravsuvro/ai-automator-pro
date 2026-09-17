/**
 * Vercel Serverless — AI generation
 * OPENAI_API_KEY enables LLM; otherwise template engine (always available).
 */
const FEATURE_PROMPTS = {
  'wix-ai-instructions': { title: 'One-Click Wix AI Instruction Set' },
  'seo-blueprint': { title: 'SEO Blueprint' },
  'content-calendar': { title: '30-Day Content Calendar' },
  'automation-recipes': { title: 'Automation Recipe Builder' },
  'email-sequences': { title: 'Email Sequence Generator' },
  'brand-voice': { title: 'Brand Voice Checker' },
  'weekly-digest': { title: 'Weekly Automation Digest' },
  'external-links': { title: 'External Links & Authority Plan' },
  'mobile-pwa': { title: 'Mobile & PWA Optimization Pack' },
};

function templateGenerate(featureId, profile, extra) {
  const name = profile.businessName || 'Your Business';
  const ind = profile.industryCustom || profile.industry || 'your industry';
  const loc = profile.location || 'your area';
  const aud = profile.audience || 'your ideal customers';
  const usp = profile.usp || 'exceptional service';
  const tone = (profile.tones || []).join(', ').toLowerCase() || 'professional';
  const feat = FEATURE_PROMPTS[featureId] || FEATURE_PROMPTS['wix-ai-instructions'];
  const base = { title: feat.title, sections: [], meta: { engine: 'template', feature: featureId } };
  if (featureId === 'wix-ai-instructions') {
    base.sections = [
      { heading: '1. Master Site Rewrite Prompt', content: `You are an expert Wix designer for ${ind}.\nBusiness: ${name}\nLocation: ${loc}\nAudience: ${aud}\nVoice: ${tone}\nUSP: ${usp}\n\nRewrite homepage, about, services, contact with benefit-led headlines and clear CTAs.` },
      { heading: '2. Content Package', content: `SEO title, meta, about (150-200 words), 4 services, 3 testimonials, 5 FAQs for ${name}. Reinforce: ${usp}.` },
      { heading: '3. How to use in Wix', content: 'Editor → text → AI → paste Master Prompt → iterate voice → apply page by page.' },
    ];
  } else if (featureId === 'seo-blueprint' || featureId === 'external-links') {
    base.sections = [
      { heading: 'Keywords & Meta', content: `Primary: ${ind} ${loc}\nTitle: ${name} | Trusted ${ind} in ${loc}` },
      { heading: 'External Citations (test after add)', content: 'Google Business Profile\nBing Places\nApple Business Connect\nLocal chamber\nNiche directories\nQA: HTTPS, mobile, NAP, no broken redirects' },
    ];
  } else if (featureId === 'mobile-pwa') {
    base.sections = [
      { heading: 'Mobile UX', content: 'Thumb CTAs, click-to-call, compress images, sticky contact, forms ≤5 fields' },
      { heading: 'App-like path', content: 'Responsive Wix + Add to Home Screen + optional Branded App + embed this SaaS full-width' },
    ];
  } else {
    base.sections = [
      { heading: 'Overview', content: `${feat.title} for ${name} (${ind}) → ${aud} in ${loc}. Voice: ${tone}. USP: ${usp}.` },
      { heading: 'Next actions', content: '1. Align homepage CTA\n2. Publish one SEO page\n3. Enable new-lead automation\n4. Add 2 external citations' + (extra ? '\n\nNotes:\n' + extra : '') },
    ];
  }
  return base;
}

async function llmGenerate(featureId, profile, extra) {
  const apiKey = process.env.OPENAI_API_KEY || process.env.AI_API_KEY;
  if (!apiKey) return null;
  const baseUrl = (process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1').replace(/\/$/, '');
  const model = process.env.AI_MODEL || 'gpt-4o-mini';
  const feat = FEATURE_PROMPTS[featureId] || FEATURE_PROMPTS['wix-ai-instructions'];
  const res = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model,
      temperature: 0.7,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: `Return JSON only {"title":string,"sections":[{"heading":string,"content":string}]} for ${feat.title}` },
        { role: 'user', content: JSON.stringify({ featureId, profile, extra }) },
      ],
    }),
  });
  if (!res.ok) throw new Error(`LLM ${res.status}`);
  const data = await res.json();
  const parsed = JSON.parse(data.choices?.[0]?.message?.content || '{}');
  if (!parsed.sections) parsed.sections = [{ heading: 'Output', content: JSON.stringify(parsed) }];
  if (!parsed.title) parsed.title = feat.title;
  parsed.meta = { engine: 'llm', model, feature: featureId };
  return parsed;
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const { featureId, profile, extra } = req.body || {};
    if (!featureId || !profile) return res.status(400).json({ error: 'featureId and profile required' });
    let result = null;
    try {
      result = await llmGenerate(featureId, profile, extra || '');
    } catch (e) {
      console.error('LLM failed:', e.message);
    }
    if (!result) result = templateGenerate(featureId, profile, extra || '');
    return res.status(200).json(result);
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Generation failed' });
  }
};
