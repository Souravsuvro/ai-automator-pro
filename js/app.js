/**
 * AI Automator Pro — Main Application
 * SPA-style navigation, profile wizard, dashboard, generators, pricing, embed docs.
 */

const App = (() => {
  let currentView = 'home';
  let wizardStep = 0;
  let draftProfile = {};
  let lastResult = null;
  let brandVoiceSample = '';

  // ---------- Utilities ----------
  function $(sel) {
    return document.querySelector(sel);
  }

  function toast(msg, type = 'success') {
    const el = $('#toast');
    const icon = $('#toast-icon');
    const text = $('#toast-msg');
    text.textContent = msg;
    icon.innerHTML =
      type === 'success'
        ? '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#4ade80" stroke-width="2.5"><path d="M20 6 9 17l-5-5"/></svg>'
        : '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f87171" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><path d="m15 9-6 6M9 9l6 6"/></svg>';
    el.classList.remove('hidden');
    setTimeout(() => el.classList.add('hidden'), 3200);
  }

  function copyText(text) {
    navigator.clipboard.writeText(text).then(
      () => toast('Copied to clipboard'),
      () => toast('Copy failed — select manually', 'error')
    );
  }

  function downloadText(filename, text) {
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    toast('Download started');
  }

  function formatResultAsText(result) {
    let out = `# ${result.title}\n\n`;
    result.sections.forEach((s) => {
      out += `## ${s.heading}\n\n${s.content}\n\n`;
    });
    const tier = Storage.getTier();
    if (tier === 'free') {
      out += `\n\n---\nGenerated with AI Automator Pro (Free tier) • Upgrade for watermark-free export & unlimited runs\n`;
    }
    return out;
  }

  function updateHeader() {
    const tier = Storage.getTier();
    const badge = $('#tier-badge');
    const btnDash = $('#btn-dashboard');
    const btnUp = $('#btn-upgrade');
    if (badge) {
      badge.classList.remove('hidden');
      badge.textContent = tier === 'free' ? 'Free' : tier === 'pro' ? 'Pro' : 'Business';
      badge.className =
        'hidden sm:flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ' +
        (tier === 'free'
          ? 'bg-slate-100 text-slate-600'
          : tier === 'pro'
          ? 'bg-brand-100 text-brand-700'
          : 'bg-amber-100 text-amber-800');
    }
    if (btnDash) {
      if (Storage.getProfile()) btnDash.classList.remove('hidden');
      else btnDash.classList.add('hidden');
    }
    if (btnUp) {
      btnUp.textContent = tier === 'free' ? 'Upgrade' : 'Manage Plan';
    }
  }

  // ---------- Navigation ----------
  function navigate(view, data = {}) {
    currentView = view;
    const main = $('#main');
    if (!main) return;
    main.innerHTML = '';
    main.className = 'flex-1 animate-fade-in';

    updateHeader();

    switch (view) {
      case 'home':
        renderHome(main);
        break;
      case 'wizard':
        renderWizard(main);
        break;
      case 'dashboard':
        renderDashboard(main);
        break;
      case 'generate':
        renderGenerate(main, data.featureId);
        break;
      case 'result':
        renderResult(main);
        break;
      case 'pricing':
        renderPricing(main);
        break;
      case 'embed':
        renderEmbed(main);
        break;
      case 'docs':
        renderDocs(main);
        break;
      default:
        renderHome(main);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // ---------- Views ----------
  function renderHome(container) {
    const hasProfile = !!Storage.getProfile();
    container.innerHTML = `
      <section class="gradient-bg text-white relative overflow-hidden">
        <div class="absolute inset-0 opacity-20" style="background-image: radial-gradient(circle at 20% 50%, #a78bfa 0%, transparent 50%), radial-gradient(circle at 80% 20%, #818cf8 0%, transparent 40%);"></div>
        <div class="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 text-center">
          <div class="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 text-sm font-medium mb-6 backdrop-blur">
            <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse-soft"></span>
            Built for Wix site owners • Ready to embed today
          </div>
          <h1 class="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight mb-6">
            One-Click Business<br class="hidden sm:block" /> Autopilot for Wix
          </h1>
          <p class="text-lg sm:text-xl text-indigo-100 max-w-2xl mx-auto mb-10 leading-relaxed">
            Fill out a short Business DNA profile once. Then generate complete, ready-to-paste Wix AI instructions, SEO blueprints, content calendars, automation recipes and more — tailored to your exact business.
          </p>
          <div class="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button onclick="App.navigate('${hasProfile ? 'dashboard' : 'wizard'}')" class="w-full sm:w-auto bg-white text-brand-700 hover:bg-brand-50 font-semibold px-8 py-3.5 rounded-xl shadow-xl shadow-black/20 transition text-base">
              ${hasProfile ? 'Go to Dashboard' : 'Create Your Business DNA'}
            </button>
            <button onclick="App.navigate('pricing')" class="w-full sm:w-auto bg-white/10 hover:bg-white/20 border border-white/30 text-white font-semibold px-8 py-3.5 rounded-xl transition text-base">
              See Pricing
            </button>
          </div>
        </div>
      </section>

      <section class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <div class="text-center mb-12">
          <h2 class="text-2xl sm:text-3xl font-bold text-slate-900 mb-3">Everything powered by one profile</h2>
          <p class="text-slate-600 max-w-xl mx-auto">Stop rewriting the same context into every prompt. Your Business DNA makes every generation precise.</p>
        </div>
        <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          ${Generators.listFeatures()
            .map(
              (f) => `
            <div class="bg-white rounded-2xl border border-slate-200 p-6 card-hover ${f.flagship ? 'ring-2 ring-brand-500/30' : ''}">
              ${f.flagship ? '<span class="inline-block text-xs font-bold uppercase tracking-wider text-brand-600 mb-2">Flagship</span>' : ''}
              <h3 class="font-semibold text-lg text-slate-900 mb-1">${f.name}</h3>
              <p class="text-sm text-slate-600 leading-relaxed">${f.description}</p>
            </div>`
            )
            .join('')}
        </div>
      </section>

      <section class="bg-slate-100/80 border-y border-slate-200">
        <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h2 class="text-2xl font-bold text-slate-900 mb-4">Faster than the Wix App Market</h2>
          <p class="text-slate-600 mb-8 max-w-2xl mx-auto">
            Ship this as a standalone web app today. Embed it on any Wix site with a simple HTML iframe element — no approval wait. Monetize directly with Stripe. Optionally package as a real Wix Blocks app later.
          </p>
          <button onclick="App.navigate('embed')" class="text-brand-600 font-semibold hover:text-brand-700 transition">
            View embed instructions →
          </button>
        </div>
      </section>
    `;
  }

  // ---------- Wizard ----------
  const WIZARD_STEPS = [
    {
      id: 'basics',
      title: 'Business Basics',
      fields: [
        { key: 'businessName', label: 'Business name', type: 'text', placeholder: 'e.g. Crystal Cars Airport Transfers', required: true },
        { key: 'industry', label: 'Industry', type: 'select', options: ['Airport Transfers & Chauffeur', 'Restaurant / Café', 'E-commerce / Retail', 'Professional Services', 'Health & Wellness', 'Home Services', 'Education / Coaching', 'SaaS / Tech', 'Real Estate', 'Beauty & Personal Care', 'Other'], required: true },
        { key: 'industryCustom', label: 'If Other, describe', type: 'text', placeholder: 'Your specific niche', showIf: (p) => p.industry === 'Other' },
        { key: 'location', label: 'Primary location / service area', type: 'text', placeholder: 'e.g. South London & Gatwick', required: true },
      ],
    },
    {
      id: 'audience',
      title: 'Audience & Goals',
      fields: [
        { key: 'audience', label: 'Who is your ideal customer?', type: 'textarea', placeholder: 'e.g. Busy professionals and families who need reliable, comfortable airport transfers and value punctuality over the cheapest price.', required: true },
        { key: 'goals', label: 'Primary goals (select all that apply)', type: 'chips', options: ['Get more leads', 'Increase online bookings', 'Improve SEO / organic traffic', 'Build brand trust', 'Launch or improve email marketing', 'Save time with automations', 'Raise average order value'], required: true },
        { key: 'usp', label: 'What makes you different? (USP)', type: 'textarea', placeholder: 'e.g. Fixed prices, flight tracking, professional drivers, 24/7 support, luxury fleet.', required: true },
      ],
    },
    {
      id: 'voice',
      title: 'Brand Voice',
      fields: [
        { key: 'tones', label: 'Choose the words that best describe your brand voice', type: 'chips', options: ['Professional', 'Friendly', 'Warm', 'Premium', 'Straightforward', 'Confident', 'Empathetic', 'Playful', 'Authoritative', 'Calm'], required: true },
        { key: 'avoid', label: 'Words or tones to avoid (optional)', type: 'text', placeholder: 'e.g. Cheap, hard-sell, overly casual slang' },
        { key: 'extraNotes', label: 'Anything else the AI should know?', type: 'textarea', placeholder: 'Competitors you dislike sounding like, specific phrases you love, seasonal focus, etc.' },
      ],
    },
  ];

  function renderWizard(container) {
    const step = WIZARD_STEPS[wizardStep];
    const progress = ((wizardStep + 1) / WIZARD_STEPS.length) * 100;

    container.innerHTML = `
      <div class="max-w-2xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
        <div class="mb-8">
          <div class="flex items-center justify-between text-sm text-slate-500 mb-2">
            <span>Step ${wizardStep + 1} of ${WIZARD_STEPS.length}</span>
            <span>${step.title}</span>
          </div>
          <div class="h-2 bg-slate-200 rounded-full overflow-hidden">
            <div class="h-full bg-brand-600 rounded-full transition-all duration-300" style="width:${progress}%"></div>
          </div>
        </div>

        <div class="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
          <h2 class="text-xl font-bold text-slate-900 mb-6">${step.title}</h2>
          <div class="space-y-5" id="wizard-fields">
            ${step.fields
              .map((f) => {
                if (f.showIf && !f.showIf(draftProfile)) return '';
                if (f.type === 'select') {
                  return `
                    <div>
                      <label class="block text-sm font-medium text-slate-700 mb-1.5">${f.label}${f.required ? ' *' : ''}</label>
                      <select data-key="${f.key}" class="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none">
                        <option value="">Select…</option>
                        ${f.options.map((o) => `<option value="${o}" ${draftProfile[f.key] === o ? 'selected' : ''}>${o}</option>`).join('')}
                      </select>
                    </div>`;
                }
                if (f.type === 'chips') {
                  const selected = draftProfile[f.key] || [];
                  return `
                    <div>
                      <label class="block text-sm font-medium text-slate-700 mb-2">${f.label}${f.required ? ' *' : ''}</label>
                      <div class="flex flex-wrap gap-2">
                        ${f.options
                          .map(
                            (o) => `
                          <button type="button" data-chip="${f.key}" data-value="${o}"
                            class="chip-btn px-3 py-1.5 rounded-full text-sm font-medium border transition ${
                              selected.includes(o)
                                ? 'bg-brand-600 text-white border-brand-600'
                                : 'bg-white text-slate-600 border-slate-300 hover:border-brand-400'
                            }">${o}</button>`
                          )
                          .join('')}
                      </div>
                    </div>`;
                }
                if (f.type === 'textarea') {
                  return `
                    <div>
                      <label class="block text-sm font-medium text-slate-700 mb-1.5">${f.label}${f.required ? ' *' : ''}</label>
                      <textarea data-key="${f.key}" rows="3" class="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none resize-y" placeholder="${f.placeholder || ''}">${draftProfile[f.key] || ''}</textarea>
                    </div>`;
                }
                return `
                  <div>
                    <label class="block text-sm font-medium text-slate-700 mb-1.5">${f.label}${f.required ? ' *' : ''}</label>
                    <input type="text" data-key="${f.key}" value="${draftProfile[f.key] || ''}" class="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none" placeholder="${f.placeholder || ''}" />
                  </div>`;
              })
              .join('')}
          </div>

          <div class="flex items-center justify-between mt-8 pt-6 border-t border-slate-100">
            <button onclick="App.wizardPrev()" class="text-sm font-medium text-slate-500 hover:text-slate-800 transition ${wizardStep === 0 ? 'invisible' : ''}">← Back</button>
            <button onclick="App.wizardNext()" class="bg-brand-600 hover:bg-brand-700 text-white font-semibold px-6 py-2.5 rounded-lg shadow-sm transition">
              ${wizardStep === WIZARD_STEPS.length - 1 ? 'Save Business DNA' : 'Continue'}
            </button>
          </div>
        </div>
      </div>
    `;

    // Chip handlers
    container.querySelectorAll('.chip-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const key = btn.dataset.chip;
        const val = btn.dataset.value;
        if (!draftProfile[key]) draftProfile[key] = [];
        const idx = draftProfile[key].indexOf(val);
        if (idx >= 0) draftProfile[key].splice(idx, 1);
        else draftProfile[key].push(val);
        renderWizard(container);
      });
    });
  }

  function collectWizardFields() {
    document.querySelectorAll('[data-key]').forEach((el) => {
      draftProfile[el.dataset.key] = el.value.trim();
    });
  }

  function wizardNext() {
    collectWizardFields();
    const step = WIZARD_STEPS[wizardStep];
    for (const f of step.fields) {
      if (f.required) {
        const val = draftProfile[f.key];
        if (f.type === 'chips' && (!val || val.length === 0)) {
          toast('Please select at least one option for: ' + f.label, 'error');
          return;
        }
        if (f.type !== 'chips' && !val) {
          toast('Please fill in: ' + f.label, 'error');
          return;
        }
      }
    }
    if (wizardStep < WIZARD_STEPS.length - 1) {
      wizardStep++;
      navigate('wizard');
    } else {
      Storage.saveProfile(draftProfile);
      toast('Business DNA saved!');
      navigate('dashboard');
    }
  }

  function wizardPrev() {
    collectWizardFields();
    if (wizardStep > 0) {
      wizardStep--;
      navigate('wizard');
    }
  }

  // ---------- Dashboard ----------
  function renderDashboard(container) {
    const profile = Storage.getProfile();
    if (!profile) {
      navigate('wizard');
      return;
    }
    const usage = Storage.canGenerate();
    const tier = Storage.getTier();
    const features = Generators.listFeatures();

    container.innerHTML = `
      <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 class="text-2xl font-bold text-slate-900">Dashboard</h1>
            <p class="text-slate-600 text-sm mt-1">Generating for <strong>${profile.businessName || 'your business'}</strong> · ${profile.industry || ''}</p>
          </div>
          <div class="flex items-center gap-3">
            <div class="text-sm text-slate-500 bg-slate-100 px-3 py-1.5 rounded-lg">
              ${tier === 'free' ? `${usage.used}/${usage.limit} generations this month` : 'Unlimited generations'}
            </div>
            <button onclick="App.editProfile()" class="text-sm font-medium text-brand-600 hover:text-brand-700">Edit DNA</button>
          </div>
        </div>

        <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          ${features
            .map(
              (f) => `
            <button onclick="App.startGenerate('${f.id}')" class="text-left bg-white rounded-2xl border border-slate-200 p-6 card-hover group ${f.flagship ? 'ring-2 ring-brand-500/40' : ''}">
              ${f.flagship ? '<span class="inline-block text-[10px] font-bold uppercase tracking-wider text-brand-600 mb-2">Flagship</span>' : '<span class="inline-block h-4 mb-2"></span>'}
              <h3 class="font-semibold text-lg text-slate-900 group-hover:text-brand-700 transition mb-1">${f.name}</h3>
              <p class="text-sm text-slate-600 leading-relaxed">${f.description}</p>
              <div class="mt-4 text-sm font-semibold text-brand-600 flex items-center gap-1">
                Generate <span class="group-hover:translate-x-0.5 transition">→</span>
              </div>
            </button>`
            )
            .join('')}
        </div>

        <div class="mt-10 bg-amber-50 border border-amber-200 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center gap-4">
          <div class="flex-1">
            <h3 class="font-semibold text-amber-900">Tip: Start with the flagship</h3>
            <p class="text-sm text-amber-800/90 mt-1">The One-Click Wix AI Instructions give you the highest leverage. Paste them into Wix AI and you’ll have a dramatically better site in minutes.</p>
          </div>
          <button onclick="App.startGenerate('wix-ai-instructions')" class="shrink-0 bg-amber-600 hover:bg-amber-700 text-white font-semibold px-5 py-2.5 rounded-lg text-sm transition">
            Run Flagship
          </button>
        </div>
      </div>
    `;
  }

  function editProfile() {
    draftProfile = { ...Storage.getProfile() };
    wizardStep = 0;
    navigate('wizard');
  }

  function startGenerate(featureId) {
    const check = Storage.canGenerate();
    if (!check.ok) {
      toast('Free limit reached (3/month). Upgrade for unlimited.', 'error');
      navigate('pricing');
      return;
    }
    navigate('generate', { featureId });
  }

  // ---------- Generate view ----------
  function renderGenerate(container, featureId) {
    const feature = Generators.FEATURES[featureId];
    if (!feature) {
      navigate('dashboard');
      return;
    }
    const profile = Storage.getProfile();

    container.innerHTML = `
      <div class="max-w-2xl mx-auto px-4 sm:px-6 py-12 text-center">
        <div class="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-brand-100 text-brand-600 mb-6">
          <svg class="animate-spin" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
        </div>
        <h2 class="text-xl font-bold text-slate-900 mb-2">Generating ${feature.name}…</h2>
        <p class="text-slate-600 text-sm">Personalizing for ${profile.businessName || 'your business'} using your Business DNA.</p>
        ${
          feature.needsExtra
            ? `
          <div class="mt-8 text-left bg-white border border-slate-200 rounded-xl p-5">
            <label class="block text-sm font-medium text-slate-700 mb-2">Paste sample copy to check (optional)</label>
            <textarea id="voice-sample" rows="4" class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" placeholder="Paste website text, email, or ad copy here…">${brandVoiceSample}</textarea>
            <button onclick="App.runBrandVoice()" class="mt-3 bg-brand-600 hover:bg-brand-700 text-white font-semibold px-5 py-2 rounded-lg text-sm">Analyze Voice</button>
          </div>`
            : ''
        }
      </div>
    `;

    if (!feature.needsExtra) {
      setTimeout(() => {
        try {
          lastResult = Generators.generate(featureId, profile);
          Storage.incrementUsage();
          Storage.addToHistory({ featureId, title: lastResult.title });
          navigate('result');
        } catch (e) {
          toast(e.message || 'Generation failed', 'error');
          navigate('dashboard');
        }
      }, 900 + Math.random() * 600);
    }
  }

  function runBrandVoice() {
    const sample = ($('#voice-sample') || {}).value || '';
    brandVoiceSample = sample;
    const profile = Storage.getProfile();
    try {
      lastResult = Generators.generate('brand-voice', profile, sample);
      Storage.incrementUsage();
      Storage.addToHistory({ featureId: 'brand-voice', title: lastResult.title });
      navigate('result');
    } catch (e) {
      toast(e.message || 'Failed', 'error');
    }
  }

  // ---------- Result ----------
  function renderResult(container) {
    if (!lastResult) {
      navigate('dashboard');
      return;
    }
    const tier = Storage.getTier();
    const isFree = tier === 'free';
    const fullText = formatResultAsText(lastResult);

    container.innerHTML = `
      <div class="max-w-3xl mx-auto px-4 sm:px-6 py-10">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <button onclick="App.navigate('dashboard')" class="text-sm text-slate-500 hover:text-slate-800 mb-1">← Dashboard</button>
            <h1 class="text-2xl font-bold text-slate-900">${lastResult.title}</h1>
          </div>
          <div class="flex flex-wrap gap-2">
            <button onclick="App.copyResult()" class="inline-flex items-center gap-1.5 bg-brand-600 hover:bg-brand-700 text-white font-semibold px-4 py-2 rounded-lg text-sm transition">
              Copy All
            </button>
            <button onclick="App.downloadResult()" class="inline-flex items-center gap-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold px-4 py-2 rounded-lg text-sm transition">
              Download .txt
            </button>
          </div>
        </div>

        ${isFree ? `
          <div class="mb-6 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-900">
            Free tier output includes a watermark. <button onclick="App.navigate('pricing')" class="font-semibold underline">Upgrade to Pro</button> for clean exports and unlimited generations.
          </div>` : ''}

        <div class="space-y-6 ${isFree ? 'watermark' : ''}">
          ${lastResult.sections
            .map(
              (s, i) => `
            <div class="bg-white rounded-2xl border border-slate-200 overflow-hidden">
              <div class="flex items-center justify-between px-5 py-3 bg-slate-50 border-b border-slate-100">
                <h2 class="font-semibold text-slate-900 text-sm">${s.heading}</h2>
                <button onclick="App.copySection(${i})" class="text-xs font-medium text-brand-600 hover:text-brand-700">Copy section</button>
              </div>
              <div class="p-5">
                <pre class="prose-output text-sm text-slate-700 font-sans whitespace-pre-wrap">${escapeHtml(s.content)}</pre>
              </div>
            </div>`
            )
            .join('')}
        </div>

        <div class="mt-8 flex justify-center">
          <button onclick="App.navigate('dashboard')" class="text-sm font-medium text-slate-500 hover:text-brand-600">Generate something else →</button>
        </div>
      </div>
    `;
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function copyResult() {
    copyText(formatResultAsText(lastResult));
  }

  function copySection(idx) {
    const s = lastResult.sections[idx];
    copyText(`## ${s.heading}\n\n${s.content}`);
  }

  function downloadResult() {
    const name = (lastResult.title || 'output').toLowerCase().replace(/[^a-z0-9]+/g, '-') + '.txt';
    downloadText(name, formatResultAsText(lastResult));
  }

  // ---------- Pricing ----------
  function renderPricing(container) {
    const current = Storage.getTier();
    container.innerHTML = `
      <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div class="text-center mb-12">
          <h1 class="text-3xl font-bold text-slate-900 mb-3">Simple, honest pricing</h1>
          <p class="text-slate-600 max-w-lg mx-auto">Start free. Upgrade when you want unlimited generations, clean exports, and team features.</p>
        </div>

        <div class="grid md:grid-cols-3 gap-6">
          <!-- Free -->
          <div class="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col ${current === 'free' ? 'ring-2 ring-slate-400' : ''}">
            <div class="mb-4">
              <h3 class="font-bold text-lg">Free</h3>
              <div class="mt-2"><span class="text-3xl font-extrabold">$0</span><span class="text-slate-500 text-sm">/mo</span></div>
            </div>
            <ul class="text-sm text-slate-600 space-y-2.5 flex-1 mb-6">
              <li>✓ 1 Business DNA profile</li>
              <li>✓ 3 generations per month</li>
              <li>✓ All core features</li>
              <li class="text-slate-400">Watermarked output</li>
            </ul>
            <button onclick="App.setTierDemo('free')" class="w-full py-2.5 rounded-lg font-semibold text-sm border border-slate-300 hover:bg-slate-50 transition ${current === 'free' ? 'bg-slate-100' : ''}">
              ${current === 'free' ? 'Current plan' : 'Downgrade (demo)'}
            </button>
          </div>

          <!-- Pro -->
          <div class="bg-white rounded-2xl border-2 border-brand-500 p-6 flex flex-col relative shadow-lg shadow-brand-500/10 ${current === 'pro' ? 'ring-2 ring-brand-400' : ''}">
            <div class="absolute -top-3 left-1/2 -translate-x-1/2 bg-brand-600 text-white text-xs font-bold px-3 py-1 rounded-full">Most popular</div>
            <div class="mb-4">
              <h3 class="font-bold text-lg text-brand-700">Pro</h3>
              <div class="mt-2"><span class="text-3xl font-extrabold">$15</span><span class="text-slate-500 text-sm">/mo</span></div>
            </div>
            <ul class="text-sm text-slate-600 space-y-2.5 flex-1 mb-6">
              <li>✓ Unlimited generations</li>
              <li>✓ All features unlocked</li>
              <li>✓ Clean, watermark-free export</li>
              <li>✓ Priority template updates</li>
            </ul>
            <a href="https://buy.stripe.com/test_pro_placeholder" target="_blank" rel="noopener"
               class="block w-full text-center py-2.5 rounded-lg font-semibold text-sm bg-brand-600 hover:bg-brand-700 text-white transition mb-2">
              Subscribe with Stripe
            </a>
            <button onclick="App.setTierDemo('pro')" class="w-full py-2 text-xs text-slate-500 hover:text-brand-600">Simulate Pro (demo only)</button>
          </div>

          <!-- Business -->
          <div class="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col ${current === 'business' ? 'ring-2 ring-amber-400' : ''}">
            <div class="mb-4">
              <h3 class="font-bold text-lg">Business</h3>
              <div class="mt-2"><span class="text-3xl font-extrabold">$39</span><span class="text-slate-500 text-sm">/mo</span></div>
            </div>
            <ul class="text-sm text-slate-600 space-y-2.5 flex-1 mb-6">
              <li>✓ Everything in Pro</li>
              <li>✓ Team seats (up to 5)</li>
              <li>✓ White-label export</li>
              <li>✓ Priority AI / support</li>
            </ul>
            <a href="https://buy.stripe.com/test_business_placeholder" target="_blank" rel="noopener"
               class="block w-full text-center py-2.5 rounded-lg font-semibold text-sm bg-slate-900 hover:bg-slate-800 text-white transition mb-2">
              Subscribe with Stripe
            </a>
            <button onclick="App.setTierDemo('business')" class="w-full py-2 text-xs text-slate-500 hover:text-brand-600">Simulate Business (demo only)</button>
          </div>
        </div>

        <p class="text-center text-xs text-slate-500 mt-8 max-w-xl mx-auto">
          Stripe links above are placeholders. Replace with your real Checkout Session or Payment Link URLs in <code class="bg-slate-100 px-1 rounded">js/app.js</code> (or better: serve them from your backend). Demo buttons only change the local tier for testing.
        </p>
      </div>
    `;
  }

  function setTierDemo(tier) {
    Storage.setTier(tier);
    toast(`Tier set to ${tier} (local demo)`);
    updateHeader();
    navigate('pricing');
  }

  // ---------- Embed Guide ----------
  function renderEmbed(container) {
    container.innerHTML = `
      <div class="max-w-3xl mx-auto px-4 sm:px-6 py-12">
        <h1 class="text-2xl font-bold text-slate-900 mb-2">Embed on any Wix site</h1>
        <p class="text-slate-600 mb-8">No App Market approval required. Host the app (Vercel, Netlify, Cloudflare Pages, or your own server) and drop it into a Wix HTML iframe element.</p>

        <div class="space-y-6">
          <div class="bg-white rounded-2xl border border-slate-200 p-6">
            <h2 class="font-semibold text-lg mb-3">1. Host the app</h2>
            <pre class="bg-slate-900 text-slate-100 text-sm rounded-xl p-4 overflow-x-auto"># Clone & serve
git clone https://github.com/Souravsuvro/ai-automator-pro.git
cd ai-automator-pro

# Option A — any static host
# Just upload index.html + js/ folder

# Option B — Vercel (recommended)
npx vercel --prod</pre>
          </div>

          <div class="bg-white rounded-2xl border border-slate-200 p-6">
            <h2 class="font-semibold text-lg mb-3">2. Add HTML iframe in Wix</h2>
            <ol class="list-decimal list-inside text-sm text-slate-700 space-y-2 mb-4">
              <li>In Wix Editor: Add → Embed Code → Custom Embed / HTML iframe</li>
              <li>Paste the code below (replace the src with your deployed URL)</li>
              <li>Set height to at least 800–1000px for comfortable use</li>
              <li>Publish</li>
            </ol>
            <pre class="bg-slate-900 text-slate-100 text-sm rounded-xl p-4 overflow-x-auto">&lt;iframe
  src="https://YOUR-DEPLOYED-URL.vercel.app"
  width="100%"
  height="900"
  style="border:0;border-radius:12px;"
  title="AI Automator Pro"
  loading="lazy"
  allow="clipboard-write"
&gt;&lt;/iframe&gt;</pre>
          </div>

          <div class="bg-white rounded-2xl border border-slate-200 p-6">
            <h2 class="font-semibold text-lg mb-3">3. Monetize with Stripe</h2>
            <p class="text-sm text-slate-600 mb-3">Create two Payment Links or Checkout Sessions in Stripe Dashboard (Pro $15/mo, Business $39/mo). Replace the placeholder URLs in the Pricing view. For production, verify the subscription status via a small backend or Stripe Customer Portal + webhook.</p>
          </div>

          <div class="bg-white rounded-2xl border border-slate-200 p-6">
            <h2 class="font-semibold text-lg mb-3">Later: Wix Blocks / App Market</h2>
            <p class="text-sm text-slate-600">See the <button onclick="App.navigate('docs')" class="text-brand-600 font-medium underline">Docs</button> section and the checklist in the repository for packaging this as a native Wix Blocks app with in-dashboard billing.</p>
          </div>
        </div>
      </div>
    `;
  }

  // ---------- Docs ----------
  function renderDocs(container) {
    container.innerHTML = `
      <div class="max-w-3xl mx-auto px-4 sm:px-6 py-12 prose prose-slate">
        <h1 class="text-2xl font-bold text-slate-900 mb-6">Documentation</h1>

        <h2 class="text-lg font-semibold mt-8 mb-2">Architecture</h2>
        <ul class="text-sm text-slate-700 space-y-1 list-disc list-inside">
          <li>Pure frontend SPA (HTML + Tailwind CDN + vanilla JS)</li>
          <li>No build step required — drop on any static host</li>
          <li>Business DNA, usage & tier stored in localStorage (demo). Replace with real auth + DB for production</li>
          <li>Generation engine is high-quality templated logic; swap for real LLM calls when ready</li>
        </ul>

        <h2 class="text-lg font-semibold mt-8 mb-2">Connecting a real LLM</h2>
        <p class="text-sm text-slate-600 mb-2">In <code>js/generators.js</code>, replace the body of each <code>generate*</code> function with a call to your backend:</p>
        <pre class="bg-slate-900 text-slate-100 text-xs rounded-xl p-4 overflow-x-auto">const res = await fetch('/api/generate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ featureId, profile, extra })
});
return await res.json(); // same shape as current return</pre>

        <h2 class="text-lg font-semibold mt-8 mb-2">Wix App Market path (later)</h2>
        <ol class="text-sm text-slate-700 space-y-1 list-decimal list-inside">
          <li>Create a Wix Blocks app or use Wix CLI</li>
          <li>Wrap this UI as a custom element or dashboard page</li>
          <li>Implement OAuth + Wix billing or keep Stripe</li>
          <li>Submit for review (see full checklist in README)</li>
        </ol>

        <h2 class="text-lg font-semibold mt-8 mb-2">Reset local data</h2>
        <button onclick="App.resetData()" class="mt-2 text-sm font-medium text-red-600 hover:text-red-700">Clear all local data (profile, usage, tier)</button>
      </div>
    `;
  }

  function resetData() {
    if (confirm('Clear all local Business DNA, usage and tier data?')) {
      Storage.clearAll();
      draftProfile = {};
      wizardStep = 0;
      lastResult = null;
      toast('Local data cleared');
      navigate('home');
    }
  }

  // ---------- Init ----------
  function init() {
    // Preload draft if editing
    const existing = Storage.getProfile();
    if (existing) draftProfile = { ...existing };
    updateHeader();
    navigate('home');
  }

  // Public API
  return {
    navigate,
    wizardNext,
    wizardPrev,
    editProfile,
    startGenerate,
    runBrandVoice,
    copyResult,
    copySection,
    downloadResult,
    setTierDemo,
    resetData,
    init,
  };
})();

// Boot
document.addEventListener('DOMContentLoaded', () => App.init());
