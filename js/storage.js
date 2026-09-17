/**
 * AI Automator Pro — Local Storage Layer
 * Profile, usage, tier, and optional Wix dashboard instance context.
 */

const Storage = (() => {
  const KEYS = {
    PROFILE: 'aap_profile_v1',
    USAGE: 'aap_usage_v1',
    TIER: 'aap_tier_v1',
    HISTORY: 'aap_history_v1',
    INSTANCE: 'aap_wix_instance_v1',
  };

  const DEFAULT_USAGE = {
    monthKey: getMonthKey(),
    generations: 0,
    lastReset: Date.now(),
  };

  function getMonthKey() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  }

  function get(key, fallback = null) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch {
      return fallback;
    }
  }

  function set(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  function getProfile() {
    return get(KEYS.PROFILE, null);
  }

  function saveProfile(profile) {
    const enriched = {
      ...profile,
      updatedAt: new Date().toISOString(),
      createdAt: profile.createdAt || new Date().toISOString(),
    };
    set(KEYS.PROFILE, enriched);
    return enriched;
  }

  function clearProfile() {
    localStorage.removeItem(KEYS.PROFILE);
  }

  function getTier() {
    return get(KEYS.TIER, 'free');
  }

  function setTier(tier) {
    if (!['free', 'pro', 'business'].includes(tier)) return;
    set(KEYS.TIER, tier);
  }

  function getUsage() {
    let usage = get(KEYS.USAGE, DEFAULT_USAGE);
    const currentMonth = getMonthKey();
    if (usage.monthKey !== currentMonth) {
      usage = { ...DEFAULT_USAGE, monthKey: currentMonth };
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
    return { ok: remaining > 0, remaining, limit, used: usage.generations };
  }

  function getHistory() {
    return get(KEYS.HISTORY, []);
  }

  function addToHistory(entry) {
    const history = getHistory();
    history.unshift({
      ...entry,
      id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
      ts: Date.now(),
    });
    set(KEYS.HISTORY, history.slice(0, 20));
  }

  function clearAll() {
    Object.values(KEYS).forEach((k) => localStorage.removeItem(k));
  }

  function getInstance() {
    return get(KEYS.INSTANCE, null);
  }

  function setInstance(payload) {
    set(KEYS.INSTANCE, payload);
  }

  function captureWixContextFromUrl() {
    try {
      const params = new URLSearchParams(window.location.search);
      const instance = params.get('instance');
      if (!instance) return null;
      const ctx = {
        instance,
        locale: params.get('locale') || 'en',
        viewMode: params.get('viewMode') || '',
        siteUrl: params.get('siteUrl') || '',
        isPublish: params.get('isPublish') === 'true',
        capturedAt: new Date().toISOString(),
      };
      setInstance(ctx);
      return ctx;
    } catch {
      return null;
    }
  }

  return {
    getProfile,
    saveProfile,
    clearProfile,
    getTier,
    setTier,
    getUsage,
    incrementUsage,
    canGenerate,
    getHistory,
    addToHistory,
    clearAll,
    getInstance,
    setInstance,
    captureWixContextFromUrl,
  };
})();
