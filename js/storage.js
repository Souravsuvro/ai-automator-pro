/**
 * AI Automator Pro — Local Storage Layer + Wix instance + demo DNA
 */
const Storage = (() => {
  const KEYS = {
    PROFILE: 'aap_profile_v1',
    USAGE: 'aap_usage_v1',
    TIER: 'aap_tier_v1',
    HISTORY: 'aap_history_v1',
    INSTANCE: 'aap_wix_instance_v1',
  };
  const DEFAULT_USAGE = { monthKey: getMonthKey(), generations: 0, lastReset: Date.now() };
  function getMonthKey() {
    const d = new Date();
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0');
  }
  function get(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : (fallback !== undefined ? fallback : null);
    } catch (e) { return fallback !== undefined ? fallback : null; }
  }
  function set(key, value) { localStorage.setItem(key, JSON.stringify(value)); }
  function getProfile() { return get(KEYS.PROFILE, null); }
  function saveProfile(profile) {
    const enriched = Object.assign({}, profile, {
      updatedAt: new Date().toISOString(),
      createdAt: profile.createdAt || new Date().toISOString(),
    });
    set(KEYS.PROFILE, enriched);
    return enriched;
  }
  function clearProfile() { localStorage.removeItem(KEYS.PROFILE); }
  function getTier() { return get(KEYS.TIER, 'free'); }
  function setTier(tier) {
    if (['free', 'pro', 'business'].indexOf(tier) === -1) return;
    set(KEYS.TIER, tier);
  }
  function getUsage() {
    let usage = get(KEYS.USAGE, DEFAULT_USAGE);
    const currentMonth = getMonthKey();
    if (usage.monthKey !== currentMonth) {
      usage = { monthKey: currentMonth, generations: 0, lastReset: Date.now() };
      set(KEYS.USAGE, usage);
    }
    return usage;
  }
  function incrementUsage() {
    const usage = getUsage();
    usage.generations += 1;
    set(KEYS.USAGE, usage);
    return usage;
  }
  function canGenerate() {
    const tier = getTier();
    if (tier === 'pro' || tier === 'business') return { ok: true, remaining: Infinity };
    const usage = getUsage();
    const limit = 3;
    const remaining = Math.max(0, limit - usage.generations);
    return { ok: remaining > 0, remaining: remaining, limit: limit, used: usage.generations };
  }
  function getHistory() { return get(KEYS.HISTORY, []); }
  function addToHistory(entry) {
    const history = getHistory();
    history.unshift(Object.assign({}, entry, {
      id: (crypto.randomUUID && crypto.randomUUID()) || String(Date.now()),
      ts: Date.now(),
    }));
    set(KEYS.HISTORY, history.slice(0, 20));
  }
  function getDemoProfile() {
    return {
      businessName: 'Harbor Light Studio',
      industry: 'Professional Services',
      industryCustom: '',
      location: 'Brighton & Hove',
      audience: 'Local small businesses that need clear brand messaging and a simple website that converts enquiries.',
      goals: ['Get more leads', 'Improve SEO / organic traffic', 'Save time with automations'],
      usp: 'Strategy-first design with fixed project pricing and a 7-day first-draft promise.',
      tones: ['Professional', 'Friendly', 'Straightforward'],
      avoid: 'Hard-sell, jargon-heavy agency speak',
      extraNotes: 'Demo profile for first-run exploration (fictional).',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isDemo: true,
    };
  }
  function clearAll() { Object.values(KEYS).forEach(function (k) { localStorage.removeItem(k); }); }
  function getInstance() { return get(KEYS.INSTANCE, null); }
  function setInstance(payload) { set(KEYS.INSTANCE, payload); }
  function captureWixContextFromUrl() {
    try {
      const params = new URLSearchParams(window.location.search);
      const instance = params.get('instance');
      if (!instance) return null;
      const ctx = {
        instance: instance,
        locale: params.get('locale') || 'en',
        viewMode: params.get('viewMode') || '',
        siteUrl: params.get('siteUrl') || '',
        isPublish: params.get('isPublish') === 'true',
        capturedAt: new Date().toISOString(),
      };
      setInstance(ctx);
      return ctx;
    } catch (e) { return null; }
  }
  return {
    getProfile: getProfile, saveProfile: saveProfile, clearProfile: clearProfile,
    getTier: getTier, setTier: setTier, getUsage: getUsage, incrementUsage: incrementUsage,
    canGenerate: canGenerate, getHistory: getHistory, addToHistory: addToHistory,
    clearAll: clearAll, getDemoProfile: getDemoProfile, getInstance: getInstance,
    setInstance: setInstance, captureWixContextFromUrl: captureWixContextFromUrl,
  };
})();
