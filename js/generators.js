/**
 * AI Automator Pro — Generation Engine (compact + API)
 */
const Generators = (() => {
  function industryPhrase(p) { return p.industryCustom || p.industry || 'your business'; }
  function tonePhrase(p) {
    const t = p.tones || [];
    if (!t.length) return 'professional and clear';
    if (t.length === 1) return t[0].toLowerCase();
    return t.slice(0, -1).join(', ').toLowerCase() + ' and ' + t[t.length - 1].toLowerCase();
  }
  function local(featureId, profile, extra) {
    const name = profile.businessName || 'Your Business';
    const ind = industryPhrase(profile);
    const loc = profile.location || 'your area';
    const aud = profile.audience || 'your ideal customers';
    const usp = profile.usp || 'exceptional service';
    const tone = tonePhrase(profile);
    const titles = {
      'wix-ai-instructions': 'One-Click Wix AI Instruction Set',
      'seo-blueprint': 'SEO Blueprint',
      'content-calendar': '30-Day Content Calendar',
      'automation-recipes': 'Automation Recipe Builder',
      'email-sequences': 'Email Sequence Generator',
      'brand-voice': 'Brand Voice Checker',
      'weekly-digest': 'Weekly Automation Digest',
      'external-links': 'External Links & Authority Plan',
      'mobile-pwa': 'Mobile & PWA Optimization Pack',
    };
    const title = titles[featureId] || featureId;
    if (featureId === 'wix-ai-instructions') {
      return { title, sections: [
        { heading: '1. Master Site Rewrite Prompt', content: `You are an expert Wix designer for ${ind}.\nBusiness: ${name}\nLocation: ${loc}\nAudience: ${aud}\nVoice: ${tone}\nUSP: ${usp}\n\nRewrite homepage, about, services, contact with benefit-led headlines and clear CTAs.` },
        { heading: '2. Content Package', content: `SEO title, meta, about (150-200 words), 4 services, 3 testimonials, 5 FAQs for ${name}. Reinforce: ${usp}.` },
        { heading: '3. How to use in Wix', content: 'Editor → text → AI → paste Master Prompt → iterate → apply page by page.' },
      ], meta: { feature: featureId, engine: 'local' } };
    }
    if (featureId === 'seo-blueprint' || featureId === 'external-links') {
      return { title, sections: [
        { heading: 'Keywords & Meta', content: `Primary: ${ind} ${loc}\nTitle: ${name} | Trusted ${ind} in ${loc}\nMeta: Reliable ${ind} in ${loc}. ${usp}.` },
        { heading: 'External Citations (test after add)', content: 'Google Business Profile\nBing Places\nApple Business Connect\nLocal chamber\nNiche directories\nQA: HTTPS, mobile, NAP, no broken redirects' },
      ], meta: { feature: featureId, engine: 'local' } };
    }
    if (featureId === 'brand-voice') {
      return { title, sections: [
        { heading: 'Voice Profile', content: `Target: ${tone}\nUSP: ${usp}\nAudience: ${aud}` },
        { heading: 'Analysis', content: extra ? `Sample (${extra.length} chars). Align to ${tone}; protect USP.` : 'Paste sample copy and re-run for a live check.' },
      ], meta: { feature: featureId, engine: 'local' } };
    }
    return { title, sections: [
      { heading: 'Overview', content: `${title} for ${name} (${ind}) → ${aud} in ${loc}. Voice: ${tone}. USP: ${usp}.` },
      { heading: 'Next actions', content: '1. Align homepage CTA\n2. Publish one SEO page\n3. Enable new-lead automation\n4. Add 2 external citations' + (extra ? '\n\n' + extra : '') },
    ], meta: { feature: featureId, engine: 'local' } };
  }
  const FEATURES = {
    'wix-ai-instructions': { name: 'One-Click Wix AI Instructions', description: 'Ready-to-paste prompts for Wix site & content AI', icon: 'sparkles', flagship: true },
    'seo-blueprint': { name: 'SEO Blueprint', description: 'Keywords, meta tags, page structure', icon: 'search' },
    'content-calendar': { name: 'Content Calendar', description: '30 days of blog & social ideas', icon: 'calendar' },
    'automation-recipes': { name: 'Automation Recipes', description: 'Wix Automations & Velo triggers', icon: 'workflow' },
    'email-sequences': { name: 'Email Sequences', description: 'Welcome, recovery, re-engagement', icon: 'mail' },
    'brand-voice': { name: 'Brand Voice Checker', description: 'Check copy against your DNA', icon: 'mic', needsExtra: true },
    'weekly-digest': { name: 'Weekly Digest', description: 'What to automate next', icon: 'list-checks' },
    'external-links': { name: 'External Links & Citations', description: 'Directories, outreach, link QA', icon: 'link' },
    'mobile-pwa': { name: 'Mobile & PWA Pack', description: 'Mobile UX and app-like delivery', icon: 'smartphone' },
  };
  Object.keys(FEATURES).forEach((id) => {
    FEATURES[id].generate = (p, extra) => local(id, p, extra);
  });
  function listFeatures() {
    return Object.entries(FEATURES).map(([id, f]) => ({
      id, name: f.name, description: f.description, icon: f.icon,
      flagship: !!f.flagship, needsExtra: !!f.needsExtra,
    }));
  }
  async function generate(featureId, profile, extra = '') {
    if (!featureId || !profile) throw new Error('featureId and profile required');
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ featureId, profile, extra }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data && data.sections) return data;
      }
    } catch (_) {}
    return local(featureId, profile, extra);
  }
  return { listFeatures, generate, generateLocal: local, FEATURES };
})();
