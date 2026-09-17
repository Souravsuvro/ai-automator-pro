/**
 * AI Automator Pro — Generation Engine v1.3
 * Research-backed: Wix AI paste workflows + AI-search/FAQ schema + citations
 */
const Generators = (() => {
  function ind(p) { return p.industryCustom || p.industry || 'your business'; }
  function tone(p) {
    const t = p.tones || [];
    if (!t.length) return 'professional and clear';
    if (t.length === 1) return t[0].toLowerCase();
    return t.slice(0, -1).join(', ').toLowerCase() + ' and ' + t[t.length - 1].toLowerCase();
  }
  function local(featureId, profile, extra) {
    const name = profile.businessName || 'Your Business';
    const industry = ind(profile);
    const loc = profile.location || 'your area';
    const aud = profile.audience || 'your ideal customers';
    const usp = profile.usp || 'exceptional service';
    const t = tone(profile);
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
      'ai-search-faq': 'AI Search & FAQ Schema Pack',
    };
    const title = titles[featureId] || featureId;
    if (featureId === 'wix-ai-instructions') {
      return { title: title, sections: [
        { heading: '1. Master Site Rewrite Prompt (paste into Wix AI / Aria)', content: 'You are an expert Wix designer for ' + industry + '.\nBusiness: ' + name + '\nLocation: ' + loc + '\nAudience: ' + aud + '\nVoice: ' + t + '\nUSP: ' + usp + '\n\nRewrite homepage, about, services, and contact with benefit-led headlines and clear CTAs.' },
        { heading: '2. Content Package Prompt', content: 'SEO title, meta, about (150-200 words), 4 services, 3 testimonials, 5 FAQs for ' + name + '. Reinforce: ' + usp + '.' },
        { heading: '3. How to use in Wix (2026)', content: '1. Editor → text → AI / Ask Aria\n2. Paste Master Prompt\n3. Iterate voice\n4. Apply page by page\n5. Optional: Marketing Agent for publishing after you approve copy' },
      ], meta: { feature: featureId, engine: 'local' } };
    }
    if (featureId === 'seo-blueprint' || featureId === 'external-links') {
      return { title: title, sections: [
        { heading: 'Keywords & Meta', content: 'Primary: ' + industry + ' ' + loc + '\nTitle: ' + name + ' | Trusted ' + industry + ' in ' + loc },
        { heading: 'External Citations (test after each add)', content: 'Google Business Profile\nBing Places\nApple Business Connect\nLocal chamber (' + loc + ')\nQA: HTTPS, mobile, NAP, no broken redirects' },
      ], meta: { feature: featureId, engine: 'local' } };
    }
    if (featureId === 'ai-search-faq') {
      return { title: title, sections: [
        { heading: 'FAQ content for Wix', content: 'Q: What does ' + name + ' offer in ' + loc + '?\nA: We provide ' + industry + ' for ' + aud + '. Our difference: ' + usp + '.\n\nQ: How do I book or contact you?\nA: Use the contact form — we respond quickly.\n\nQ: Who is this for?\nA: ' + aud + '.\n\nQ: What makes you different?\nA: ' + usp + '.' },
        { heading: 'JSON-LD FAQ schema', content: '{\n  "@context": "https://schema.org",\n  "@type": "FAQPage",\n  "mainEntity": [{\n    "@type": "Question",\n    "name": "What does ' + name + ' offer?",\n    "acceptedAnswer": { "@type": "Answer", "text": "' + usp + ' for ' + aud + ' in ' + loc + '." }\n  }]\n}' },
        { heading: 'AI search visibility tips', content: 'Answer questions in plain language\nKeep NAP consistent with Google Business\nPublish 1 FAQ-rich post monthly\nEnsure pages are indexable' },
      ], meta: { feature: featureId, engine: 'local' } };
    }
    if (featureId === 'brand-voice') {
      return { title: title, sections: [
        { heading: 'Voice Profile', content: 'Target: ' + t + '\nUSP: ' + usp + '\nAudience: ' + aud },
        { heading: 'Analysis', content: extra ? ('Sample (' + extra.length + ' chars). Align to ' + t + '.') : 'Paste sample copy and re-run.' },
      ], meta: { feature: featureId, engine: 'local' } };
    }
    return { title: title, sections: [
      { heading: 'Overview', content: title + ' for ' + name + ' (' + industry + ') → ' + aud + ' in ' + loc + '.' },
      { heading: 'Next actions', content: '1. Align homepage CTA\n2. Publish one SEO page\n3. Enable new-lead automation\n4. Add 2 citations\n5. Publish FAQ for AI search' + (extra ? '\n\n' + extra : '') },
    ], meta: { feature: featureId, engine: 'local' } };
  }
  const FEATURES = {
    'wix-ai-instructions': { name: 'One-Click Wix AI Instructions', description: 'Ready-to-paste prompts for Wix AI / Aria', icon: 'sparkles', flagship: true },
    'seo-blueprint': { name: 'SEO Blueprint', description: 'Keywords, meta tags, on-page structure', icon: 'search' },
    'ai-search-faq': { name: 'AI Search & FAQ Schema', description: 'FAQ copy + schema for AI/search visibility', icon: 'bot', pro: true },
    'content-calendar': { name: 'Content Calendar', description: '30 days of blog & social ideas', icon: 'calendar' },
    'automation-recipes': { name: 'Automation Recipes', description: 'Wix Automations & Velo triggers', icon: 'workflow' },
    'email-sequences': { name: 'Email Sequences', description: 'Welcome, recovery, re-engagement', icon: 'mail' },
    'brand-voice': { name: 'Brand Voice Checker', description: 'Check copy against your DNA', icon: 'mic', needsExtra: true },
    'weekly-digest': { name: 'Weekly Digest', description: 'What to automate next', icon: 'list-checks' },
    'external-links': { name: 'External Links & Citations', description: 'Directories, outreach, link QA', icon: 'link' },
    'mobile-pwa': { name: 'Mobile & PWA Pack', description: 'Mobile UX and app-like delivery', icon: 'smartphone' },
  };
  Object.keys(FEATURES).forEach(function (id) {
    FEATURES[id].generate = function (p, extra) { return local(id, p, extra); };
  });
  function listFeatures() {
    return Object.entries(FEATURES).map(function (e) {
      var id = e[0], f = e[1];
      return { id: id, name: f.name, description: f.description, icon: f.icon, flagship: !!f.flagship, needsExtra: !!f.needsExtra, pro: !!f.pro };
    });
  }
  function generate(featureId, profile, extra) {
    if (!featureId || !profile) throw new Error('featureId and profile required');
    return local(featureId, profile, extra || '');
  }
  async function generateAsync(featureId, profile, extra) {
    try {
      var res = await fetch('/api/generate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ featureId: featureId, profile: profile, extra: extra || '' }) });
      if (res.ok) { var data = await res.json(); if (data && data.sections) return data; }
    } catch (e) {}
    return local(featureId, profile, extra || '');
  }
  return { listFeatures: listFeatures, generate: generate, generateAsync: generateAsync, generateLocal: local, FEATURES: FEATURES };
})();
