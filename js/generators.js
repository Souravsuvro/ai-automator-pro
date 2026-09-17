/**
 * AI Automator Pro — Generation Engine
 * High-quality template + logic based "AI" that produces ready-to-use outputs
 * tailored to the Business DNA profile.
 *
 * To connect a real LLM later:
 *   1. Replace the body of each generate* function with a fetch to your backend
 *      (or OpenAI / Grok / Claude API).
 *   2. Pass the full profile + feature type as the system/user prompt.
 *   3. Keep the same return shape so the UI stays unchanged.
 */

const Generators = (() => {
  // ---------- Helpers ----------
  function pick(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  function slugify(str) {
    return (str || '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }

  function titleCase(str) {
    return (str || '')
      .split(' ')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
  }

  function industryPhrase(profile) {
    return profile.industryCustom || profile.industry || 'your business';
  }

  function tonePhrase(profile) {
    const tones = profile.tones || [];
    if (tones.length === 0) return 'professional and clear';
    if (tones.length === 1) return tones[0].toLowerCase();
    return tones.slice(0, -1).join(', ').toLowerCase() + ' and ' + tones[tones.length - 1].toLowerCase();
  }

  function audiencePhrase(profile) {
    return profile.audience || 'your ideal customers';
  }

  function goalsList(profile) {
    return (profile.goals || []).length
      ? profile.goals.join(', ')
      : 'grow traffic, convert visitors, and build trust';
  }

  // ---------- Flagship: One-Click Wix AI Instructions ----------
  function generateWixAIInstructions(profile) {
    const ind = industryPhrase(profile);
    const tone = tonePhrase(profile);
    const aud = audiencePhrase(profile);
    const usp = profile.usp || 'exceptional service and results';
    const location = profile.location || 'your service area';

    const sitePrompt = `You are an expert Wix site designer and copywriter specializing in ${ind}.

BUSINESS CONTEXT
- Business name: ${profile.businessName || '[Your Business Name]'}
- Industry: ${ind}
- Location / Service area: ${location}
- Ideal customer: ${aud}
- Brand voice: ${tone}
- Unique value: ${usp}
- Primary goals: ${goalsList(profile)}

TASK
Rewrite and improve the entire site (homepage, about, services, contact) so it:
1. Speaks directly to ${aud} in a ${tone} voice.
2. Highlights "${usp}" as the core differentiator.
3. Uses clear benefit-driven headlines and short paragraphs.
4. Includes strong calls-to-action on every major section.
5. Feels premium, trustworthy, and conversion-focused for a Wix site.

OUTPUT FORMAT
- Homepage hero (headline + subheadline + primary CTA)
- 3–4 benefit sections with short copy
- Services / offers overview
- Social proof suggestions
- About snippet
- Final CTA block
Keep language ${tone}. Avoid jargon.`;

    const contentPrompt = `Generate a complete content package for a ${ind} business targeting ${aud}.

Brand voice: ${tone}
USP: ${usp}

Include:
1. Homepage SEO title (≤60 chars) + meta description (≤155 chars)
2. About page core story (150–200 words)
3. 4 service/feature descriptions (each 40–60 words)
4. 3 testimonial templates with realistic names and roles
5. FAQ section (5 questions + answers)
6. Contact page intro + form field suggestions

All copy must stay in a ${tone} tone and reinforce "${usp}".`;

    const imagePrompt = `Create a consistent visual direction for a ${ind} Wix site:
- Primary style: modern, clean, ${tone.includes('luxury') || tone.includes('premium') ? 'premium/minimal' : 'friendly and professional'}
- Color mood: [suggest 1 primary + 2 supporting based on industry]
- Photography style: authentic, high-quality images of ${aud} benefiting from the service
- Avoid: stock-looking smiles, overly corporate boardrooms
- Suggested image keywords for Wix AI Image / Media Manager: ...`;

    return {
      title: 'One-Click Wix AI Instruction Set',
      sections: [
        {
          heading: '1. Master Site Rewrite Prompt (paste into Wix AI)',
          content: sitePrompt,
        },
        {
          heading: '2. Full Content Package Prompt',
          content: contentPrompt,
        },
        {
          heading: '3. Visual & Image Direction Prompt',
          content: imagePrompt,
        },
        {
          heading: 'How to use',
          content: `1. Open your Wix Editor → select any text element → click the AI icon (or use Wix AI Site Generator if available).\n2. Paste the Master Site Rewrite Prompt first for a full overhaul.\n3. Use the Content Package Prompt for individual pages or blog posts.\n4. Feed the Visual Direction into Wix AI Image or your media search.\n5. Iterate: after the first generation, reply with “Make it more [adjective]” or “Shorten the hero”.`,
        },
      ],
      meta: { feature: 'wix-ai-instructions', profileSnapshot: { industry: ind, tone } },
    };
  }

  // ---------- SEO Blueprint ----------
  function generateSEOBlueprint(profile) {
    const ind = industryPhrase(profile);
    const aud = audiencePhrase(profile);
    const loc = profile.location || 'local area';
    const name = profile.businessName || 'Your Business';

    const primaryKeywords = [
      `${ind} ${loc}`.toLowerCase(),
      `best ${ind} near me`,
      `${ind} services ${loc}`,
      `professional ${ind}`,
      `${name.toLowerCase()} reviews`,
    ];

    const secondary = [
      `how to choose a ${ind}`,
      `${ind} cost ${loc}`,
      `${ind} for ${aud.toLowerCase().split(' ')[0] || 'businesses'}`,
      `top-rated ${ind}`,
      `${ind} tips`,
    ];

    const pages = [
      {
        page: 'Homepage',
        title: `${name} | Trusted ${titleCase(ind)} in ${loc}`,
        meta: `Looking for reliable ${ind} in ${loc}? ${name} delivers ${profile.usp || 'outstanding results'} for ${aud}. Book your free consultation today.`,
        h1: `The ${titleCase(ind)} ${aud} Trust in ${loc}`,
      },
      {
        page: 'Services',
        title: `${titleCase(ind)} Services | ${name}`,
        meta: `Explore our full range of ${ind} services designed for ${aud}. Transparent pricing, proven process, exceptional outcomes.`,
        h1: `${titleCase(ind)} Services Built for Real Results`,
      },
      {
        page: 'About',
        title: `About ${name} | Our Story & Values`,
        meta: `Learn why ${aud} choose ${name}. Our mission, values, and the team behind the results.`,
        h1: `Why ${name} Exists`,
      },
      {
        page: 'Contact / Book',
        title: `Contact ${name} | Get Started Today`,
        meta: `Ready to experience better ${ind}? Contact ${name} in ${loc}. Fast response, no-pressure consultation.`,
        h1: `Let's Talk About Your Goals`,
      },
    ];

    return {
      title: 'SEO Blueprint',
      sections: [
        {
          heading: 'Primary Keyword Targets',
          content: primaryKeywords.map((k, i) => `${i + 1}. ${k}`).join('\n'),
        },
        {
          heading: 'Secondary & Long-tail Keywords',
          content: secondary.map((k, i) => `${i + 1}. ${k}`).join('\n'),
        },
        {
          heading: 'Recommended Page Structure & Meta',
          content: pages
            .map(
              (p) =>
                `### ${p.page}\nTitle: ${p.title}\nMeta: ${p.meta}\nH1: ${p.h1}\n`
            )
            .join('\n'),
        },
        {
          heading: 'On-Page Checklist for Wix',
          content: `• Use the exact primary keyword in the first 100 words of homepage body\n• Add location + service in image alt text\n• Create a dedicated /services/[service-name] page for each main offer\n• Enable Wix SEO Wiz and connect Google Search Console\n• Add FAQ schema via Wix or custom code for rich results\n• Internal link from blog posts back to service pages\n• Aim for 3–5 external citations (directories, partners)`,
        },
      ],
      meta: { feature: 'seo-blueprint' },
    };
  }

  // ---------- Content Calendar ----------
  function generateContentCalendar(profile) {
    const ind = industryPhrase(profile);
    const tone = tonePhrase(profile);
    const aud = audiencePhrase(profile);

    const themes = [
      'Educational / How-to',
      'Social proof & results',
      'Behind the scenes',
      'Seasonal / timely tip',
      'Myth-busting',
      'Client success story',
      'Quick tip carousel',
      'FAQ answer',
      'Comparison / vs',
      'Inspiration / mindset',
    ];

    const days = [];
    for (let d = 1; d <= 30; d++) {
      const theme = themes[d % themes.length];
      const platform = d % 3 === 0 ? 'Blog + LinkedIn' : d % 2 === 0 ? 'Instagram / Facebook' : 'Short-form (Reels / TikTok idea)';
      days.push({
        day: d,
        theme,
        platform,
        idea: `${theme} content for ${ind} aimed at ${aud}`,
        captionSeed: `Write a ${tone} caption that starts with a hook about ${ind.toLowerCase()} and ends with a soft CTA. Keep under 150 words.`,
      });
    }

    const samplePosts = days.slice(0, 7).map(
      (d) =>
        `Day ${d.day} — ${d.theme} (${d.platform})\nIdea: ${d.idea}\nCaption starter: ${d.captionSeed}\n`
    );

    return {
      title: '30-Day Content Calendar',
      sections: [
        {
          heading: 'Overview',
          content: `A balanced mix of educational, social-proof, and engagement content tailored to ${aud} in the ${ind} space. Voice: ${tone}.`,
        },
        {
          heading: 'Week 1 Detailed Posts',
          content: samplePosts.join('\n'),
        },
        {
          heading: 'Full 30-Day Theme Map',
          content: days.map((d) => `Day ${String(d.day).padStart(2, '0')}: ${d.theme} → ${d.platform}`).join('\n'),
        },
        {
          heading: 'How to execute in Wix',
          content: `• Use Wix Blog for long-form (Days marked Blog)\n• Use Wix Social Posts or native Instagram/Facebook integrations\n• Batch-create images with Wix AI Image using the visual direction from the One-Click generator\n• Schedule via Wix or Buffer/Meta Business Suite\n• Track engagement weekly and double-down on top themes`,
        },
      ],
      meta: { feature: 'content-calendar' },
    };
  }

  // ---------- Automation Recipe Builder ----------
  function generateAutomationRecipes(profile) {
    const ind = industryPhrase(profile);
    const name = profile.businessName || 'Your Business';

    const recipes = [
      {
        name: 'New Lead Welcome Sequence',
        trigger: 'Form submitted (Contact / Quote form)',
        actions: [
          'Send immediate email: “Thanks for reaching out – here’s what happens next”',
          'Add contact to “New Leads” list / CRM label',
          'Notify team via email or Slack (if connected)',
          'Wait 1 day → Send value email with relevant case study or tip for ' + ind,
          'Wait 3 days → Soft CTA to book a call',
        ],
        veloHint: 'Use Wix Automations → Form submission trigger → Email + Delay + Email. For advanced: Velo onFormSubmit + wix-crm-backend.',
      },
      {
        name: 'Abandoned Booking / Cart Recovery',
        trigger: 'User starts booking flow but does not complete (or cart abandoned)',
        actions: [
          'Wait 1 hour → Email “Still thinking it over? Here’s a quick reminder”',
          'Wait 24 hours → Email with social proof + limited-time incentive (if appropriate)',
          'Wait 3 days → Final “We’re here when you’re ready” message',
        ],
        veloHint: 'Wix Bookings or Stores + Automations. For custom: track session events with Velo and trigger via backend.',
      },
      {
        name: 'Post-Service Review Request',
        trigger: 'Booking completed or order marked fulfilled',
        actions: [
          'Wait 2 days → Email asking for feedback + direct review link (Google / Facebook)',
          'If positive reply detected (manual or keyword) → Thank + ask for testimonial permission',
          'Add to “Happy Customers” segment for future case studies',
        ],
        veloHint: 'Wix Bookings completion trigger or Stores order status change → Email automation.',
      },
      {
        name: 'Re-engagement for Quiet Contacts',
        trigger: 'Contact has not opened email or visited site in 45+ days',
        actions: [
          'Send “We miss you” email with a helpful tip related to ' + ind,
          'Offer a small exclusive (guide, checklist, or discount)',
          'If no engagement after 14 days → move to low-priority or suppress',
        ],
        veloHint: 'Requires CRM segment + scheduled automation or external tool (Klaviyo / Mailchimp) connected via Zapier / Make.',
      },
      {
        name: 'New Blog Post Amplification',
        trigger: 'New blog post published',
        actions: [
          'Auto-share to connected social channels',
          'Send to email list segment interested in the topic',
          'Add internal links from related older posts (manual or Velo)',
        ],
        veloHint: 'Wix Blog + Social integrations + Automations on publish event.',
      },
    ];

    return {
      title: 'Automation Recipe Builder',
      sections: [
        {
          heading: 'Ready-to-Build Recipes for ' + name,
          content: recipes
            .map(
              (r, i) =>
                `### Recipe ${i + 1}: ${r.name}\nTrigger: ${r.trigger}\n\nActions:\n${r.actions.map((a) => '• ' + a).join('\n')}\n\nWix / Velo tip: ${r.veloHint}\n`
            )
            .join('\n'),
        },
        {
          heading: 'Implementation Priority',
          content: `1. New Lead Welcome (highest ROI)\n2. Post-Service Review Request\n3. Abandoned flow\n4. Re-engagement\n5. Blog amplification\n\nStart with native Wix Automations. Graduate to Velo only when you need custom data or complex conditions.`,
        },
      ],
      meta: { feature: 'automation-recipes' },
    };
  }

  // ---------- Email Sequence Generator ----------
  function generateEmailSequence(profile) {
    const ind = industryPhrase(profile);
    const tone = tonePhrase(profile);
    const aud = audiencePhrase(profile);
    const usp = profile.usp || 'exceptional results';
    const name = profile.businessName || 'Us';

    const sequences = {
      welcome: [
        {
          day: 0,
          subject: `Welcome — here’s what to expect from ${name}`,
          preview: 'A quick hello and the first useful thing we can give you',
          body: `Hi {{first_name}},\n\nThanks for joining us.\n\nWe help ${aud} get better outcomes in ${ind} through ${usp}.\n\nOver the next few days I’ll share a few short, practical emails. No fluff.\n\nTalk soon,\nThe ${name} team`,
        },
        {
          day: 2,
          subject: `The #1 mistake we see in ${ind}`,
          preview: 'And the simple shift that fixes it',
          body: `Hi {{first_name}},\n\nMost people in ${ind} focus on [common pain]. The ones who pull ahead do this instead: [insight tied to USP].\n\nHere’s a 2-minute way to apply it today…\n\n[Short tip]\n\nReply and tell me if this resonates — I read every message.\n\nBest,\n${name}`,
        },
        {
          day: 5,
          subject: `How [Customer type] got results with ${name}`,
          preview: 'A short story + what you can copy',
          body: `Hi {{first_name}},\n\nQuick story.\n\n[Fictional but realistic mini case study for ${aud}].\n\nThe same approach is available to you. If you want the details, just hit reply or book a quick call here: [link]\n\nTalk soon,\n${name}`,
        },
      ],
      abandoned: [
        {
          day: 0,
          subject: 'Still thinking it over?',
          body: `Hi {{first_name}},\n\nYou were looking at [offer]. No pressure — just wanted to make sure you have everything you need.\n\nAny questions I can answer?\n\n${name}`,
        },
        {
          day: 2,
          subject: 'A little extra help deciding',
          body: `Hi {{first_name}},\n\nHere’s a short FAQ that usually helps people in your situation…\n\n[3 bullets]\n\nWhenever you’re ready, we’re here.\n\n${name}`,
        },
      ],
      reengage: [
        {
          day: 0,
          subject: `It’s been a while — quick ${ind} tip inside`,
          body: `Hi {{first_name}},\n\nWe haven’t spoken in a bit. Here’s one useful thing we’ve been sharing with ${aud} lately…\n\n[Tip]\n\nIf you’d like more of this (or less), just let me know.\n\n${name}`,
        },
      ],
    };

    return {
      title: 'Email Sequence Generator',
      sections: [
        {
          heading: 'Welcome Series (3 emails)',
          content: sequences.welcome
            .map(
              (e) =>
                `Day ${e.day} — Subject: ${e.subject}\nPreview: ${e.preview || ''}\n\n${e.body}\n\n---`
            )
            .join('\n\n'),
        },
        {
          heading: 'Abandoned Cart / Booking Recovery',
          content: sequences.abandoned
            .map((e) => `Day ${e.day} — Subject: ${e.subject}\n\n${e.body}\n\n---`)
            .join('\n\n'),
        },
        {
          heading: 'Re-engagement',
          content: sequences.reengage
            .map((e) => `Subject: ${e.subject}\n\n${e.body}`)
            .join('\n\n'),
        },
        {
          heading: 'Tone & Personalization Notes',
          content: `All copy is written in a ${tone} voice.\nReplace {{first_name}} and [placeholders] with your CRM fields or Wix Automations merge tags.\nKeep the USP (“${usp}”) consistent across every message.`,
        },
      ],
      meta: { feature: 'email-sequences' },
    };
  }

  // ---------- Brand Voice Checker ----------
  function generateBrandVoiceCheck(profile, sampleCopy = '') {
    const tone = tonePhrase(profile);
    const usp = profile.usp || '';
    const ind = industryPhrase(profile);

    // Simple heuristic scoring for demo
    const lower = (sampleCopy || '').toLowerCase();
    const issues = [];
    if (sampleCopy.length < 40) {
      issues.push('Sample is very short — paste a fuller paragraph for better analysis.');
    }
    if (lower.includes('synergy') || lower.includes('leverage') || lower.includes('disrupt')) {
      issues.push('Contains corporate buzzwords that may clash with a clear, human voice.');
    }
    if (tone.includes('friendly') && (lower.includes('pursuant') || lower.includes('hereinafter'))) {
      issues.push('Legalistic language detected — feels colder than your preferred friendly tone.');
    }
    if (usp && !lower.includes(usp.toLowerCase().slice(0, 12))) {
      issues.push(`Consider weaving in your unique value (“${usp}”) more explicitly.`);
    }

    const score = Math.max(40, 95 - issues.length * 12);

    return {
      title: 'Brand Voice Checker',
      sections: [
        {
          heading: 'Voice Profile Summary',
          content: `Target voice: ${tone}\nIndustry context: ${ind}\nCore message to protect: ${usp || 'Not specified'}`,
        },
        {
          heading: 'Analysis of Provided Copy',
          content: sampleCopy
            ? `Alignment score: ${score}/100\n\n${issues.length ? 'Flags:\n' + issues.map((i) => '• ' + i).join('\n') : 'No major flags. Copy sits comfortably inside the defined voice.'}`
            : 'No sample provided. Paste any website, email or ad copy into the input field and re-run for a live check.',
        },
        {
          heading: 'Quick Voice Guardrails',
          content: `Do:\n• Speak directly to ${audiencePhrase(profile)}\n• Lead with benefits, not features\n• Keep sentences relatively short and concrete\n\nDon’t:\n• Overuse jargon from ${ind}\n• Sound like every other competitor\n• Hide the human behind the brand`,
        },
      ],
      meta: { feature: 'brand-voice' },
    };
  }

  // ---------- Weekly Digest ----------
  function generateWeeklyDigest(profile) {
    const ind = industryPhrase(profile);
    const goals = profile.goals || [];

    const suggestions = [
      `Review last week’s top-performing content and double down on that theme for ${ind}.`,
      `Set up (or refine) the New Lead Welcome automation — highest leverage for most Wix sites.`,
      `Audit homepage hero against your current USP. Does it still feel sharp?`,
      `Add or update 2–3 FAQs based on real customer questions from the last 14 days.`,
      `Create one short-form video or carousel that answers a common objection.`,
      `Check Google Search Console for new keyword opportunities related to ${ind}.`,
      `Send a quick value email to your list (not a hard sell).`,
    ];

    // Prioritize based on goals
    let prioritized = [...suggestions];
    if (goals.some((g) => /lead|convert|sale/i.test(g))) {
      prioritized = [
        'Focus this week on conversion: test a stronger homepage CTA and make sure the welcome sequence is live.',
        ...prioritized,
      ];
    }
    if (goals.some((g) => /traffic|seo|visibility/i.test(g))) {
      prioritized = [
        'Publish one SEO-optimized blog post targeting a primary keyword from your Blueprint.',
        ...prioritized,
      ];
    }

    return {
      title: 'Weekly Automation Digest',
      sections: [
        {
          heading: 'This Week’s Focus',
          content: prioritized.slice(0, 5).map((s, i) => `${i + 1}. ${s}`).join('\n\n'),
        },
        {
          heading: 'Quick Wins (under 30 min each)',
          content: `• Update one meta description using the SEO Blueprint\n• Rewrite a single service description in your brand voice\n• Schedule the next 3 social posts from the Content Calendar\n• Check Wix Automations dashboard for any failed runs`,
        },
        {
          heading: 'What to measure',
          content: `• Form submissions / booking requests\n• Email open & click rates (welcome sequence)\n• Organic traffic to top 3 pages\n• Time-on-page for homepage`,
        },
      ],
      meta: { feature: 'weekly-digest' },
    };
  }

  // ---------- Public API ----------
  const FEATURES = {
    'wix-ai-instructions': {
      name: 'One-Click Wix AI Instructions',
      description: 'Complete, ready-to-paste prompt set for Wix’s site & content AI',
      icon: 'sparkles',
      generate: generateWixAIInstructions,
      flagship: true,
    },
    'seo-blueprint': {
      name: 'SEO Blueprint',
      description: 'Keyword targets, meta tags, page structure & on-page checklist',
      icon: 'search',
      generate: generateSEOBlueprint,
    },
    'content-calendar': {
      name: 'Content Calendar',
      description: '30 days of blog & social ideas with caption starters',
      icon: 'calendar',
      generate: generateContentCalendar,
    },
    'automation-recipes': {
      name: 'Automation Recipes',
      description: 'Plain-English Wix Automations & Velo triggers ready to build',
      icon: 'workflow',
      generate: generateAutomationRecipes,
    },
    'email-sequences': {
      name: 'Email Sequences',
      description: 'Welcome, abandoned-cart and re-engagement series',
      icon: 'mail',
      generate: generateEmailSequence,
    },
    'brand-voice': {
      name: 'Brand Voice Checker',
      description: 'Paste any copy and see how well it matches your DNA',
      icon: 'mic',
      generate: (p, extra) => generateBrandVoiceCheck(p, extra),
      needsExtra: true,
    },
    'weekly-digest': {
      name: 'Weekly Digest',
      description: 'What to automate or improve next — prioritized for your goals',
      icon: 'list-checks',
      generate: generateWeeklyDigest,
    },
  };

  function listFeatures() {
    return Object.entries(FEATURES).map(([id, f]) => ({
      id,
      name: f.name,
      description: f.description,
      icon: f.icon,
      flagship: !!f.flagship,
      needsExtra: !!f.needsExtra,
    }));
  }

  function generate(featureId, profile, extra = '') {
    const feature = FEATURES[featureId];
    if (!feature) throw new Error('Unknown feature: ' + featureId);
    if (!profile) throw new Error('Business DNA profile required');
    return feature.generate(profile, extra);
  }

  return {
    listFeatures,
    generate,
    FEATURES,
  };
})();
