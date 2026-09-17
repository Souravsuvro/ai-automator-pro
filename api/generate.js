/**
 * Vercel Serverless — AI generation endpoint
 * OPENAI_API_KEY enables real LLM; otherwise high-quality templates.
 */
const FEATURE_PROMPTS = {
  'wix-ai-instructions': { title: 'One-Click Wix AI Instruction Set', system: 'You are a Wix site strategist. Return JSON: {"title":string,"sections":[{"heading":string,"content":string}]}' },
  'seo-blueprint': { title: 'SEO Blueprint', system: 'You are an SEO specialist for Wix. Return JSON with keywords, meta, structure, external links.' },
  'content-calendar': { title: '30-Day Content Calendar', system: 'Content strategist. Return JSON sections.' },
  'automation-recipes': { title: 'Automation Recipe Builder', system: 'Wix Automations expert. Return JSON sections.' },
  'email-sequences': { title: 'Email Sequence Generator', system: 'Email marketing expert. Return JSON sections.' },
  'brand-voice': { title: 'Brand Voice Checker', system: 'Brand voice editor. Return JSON sections.' },
  'weekly-digest': { title: 'Weekly Automation Digest', system: 'Growth operator. Return JSON sections.' },
  'external-links': { title: 'External Links & Authority Plan', system: 'Local SEO specialist. Return JSON with directories and QA checklist.' },
  'mobile-pwa': { title: 'Mobile & PWA Optimization Pack', system: 'Mobile UX specialist. Return JSON sections.' },
};

function buildUserPrompt(featureId, profile, extra) {
  return [
    `Feature: ${featureId}`,
    `Business: ${profile.businessName || 'N/A'}`,
    `Industry: ${profile.industryCustom || profile.industry || 'N/A'}`,
    `Location: ${profile.location || 'N/A'}`,
    `Audience: ${profile.audience || 'N/A'}`,
    `USP: ${profile.usp || 'N/A'}`,
    `Goals: ${(profile.goals || []).join(', ') || 'N/A'}`,
    `Tones: ${(profile.tones || []).join(', ') || 'N/A'}`,
    extra ? `Extra:\n${extra}` : '',
    'Write concrete, ready-to-use output.',
  ].filter(Boolean).join('\n');
}

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
      { heading: '2. Content Package Prompt', content: `SEO title, meta, about (150-200 words), 4 services, 3 testimonials, 5 FAQs for ${name} serving ${aud} in ${loc}. Reinforce: ${usp}.` },
      { heading: '3. How to use in Wix', content: '1. Editor → text → AI\n2. Paste Master Prompt\n3. Iterate voice\n4. Apply Content Package page by page' },
    ];
  } else if (featureId === 'seo-blueprint' || featureId === 'external-links') {
    base.sections = [
      { heading: 'Keywords & Meta', content: `Primary: ${ind} ${loc}\nTitle: ${name} | Trusted ${ind} in ${loc}\nMeta: Reliable ${ind} in ${loc}. ${usp}.` },
      { heading: 'External Citations (test after add)', content: '• Google Business Profile\n• Bing Places\n• Apple Business Connect\n• Local chamber\n• Niche directories\nQA: HTTPS, mobile, NAP consistency, no broken redirects' },
    ];
  } else if (featureId === 'mobile-pwa') {
    base.sections = [
      { heading: 'Mobile UX', content: 'Thumb CTAs, click-to-call, compress images, sticky contact, forms ≤5 fields' },
      { heading: 'App-like path', content: 'Responsive Wix + Add to Home Screen + optional Branded App + embed this SaaS full-width' },
    ];
  } else {
    base.sections = [
      { heading: 'Overview', content: `${feat.title} for ${name} (${ind}) → ${aud} in ${loc}. Voice: ${tone}. USP: ${usp}.` },
      { heading: 'Next actions', content: '1. Align homepage CTA\n2. Publish one SEO page\n3. Enable new-lead automation\n4. Add 2 external citations' },
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
      model, temperature: 0.7, response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: feat.system + ' Return JSON only: {"title":string,"sections":[{"heading":string,"content":string}]}' },
        { role: 'user', content: buildUserPrompt(featureId, profile, extra) },
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
    try { result = await llmGenerate(featureId, profile, extra || ''); } catch (e) { console.error(e.message); }
    if (!result) result = templateGenerate(featureId, profile, extra || '');
    return res.status(200).json(result);
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Generation failed' });
  }
};
