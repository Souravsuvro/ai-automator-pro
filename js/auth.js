const Auth = (() => {
  const TOKEN_KEY = 'aap_auth_token_v1';
  const USER_KEY = 'aap_auth_user_v1';
  function getToken() { try { return localStorage.getItem(TOKEN_KEY); } catch (_) { return null; } }
  function setSession(token, user) {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    if (user && user.tier && typeof Storage !== 'undefined' && Storage.setTier) Storage.setTier(user.tier);
  }
  function clearSession() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }
  function getUser() {
    try { const raw = localStorage.getItem(USER_KEY); return raw ? JSON.parse(raw) : null; } catch (_) { return null; }
  }
  function isLoggedIn() { return !!getToken(); }
  function getWixInstanceFromUrl() {
    try { return new URLSearchParams(window.location.search).get('instance') || null; } catch (_) { return null; }
  }
  async function api(path, options) {
    options = options || {};
    const headers = Object.assign({ 'Content-Type': 'application/json' }, options.headers || {});
    const token = getToken();
    if (token) headers.Authorization = 'Bearer ' + token;
    const res = await fetch(path, Object.assign({}, options, { headers: headers }));
    const data = await res.json().catch(function () { return {}; });
    if (!res.ok) throw new Error(data.error || res.statusText || 'Request failed');
    return data;
  }
  async function register(email, password, name) {
    const data = await api('/api/auth/register', { method: 'POST', body: JSON.stringify({ email: email, password: password, name: name, wixInstance: getWixInstanceFromUrl() }) });
    setSession(data.token, data.user);
    return data.user;
  }
  async function login(email, password) {
    const data = await api('/api/auth/login', { method: 'POST', body: JSON.stringify({ email: email, password: password, wixInstance: getWixInstanceFromUrl() }) });
    setSession(data.token, data.user);
    return data.user;
  }
  async function me() {
    const data = await api('/api/auth/me');
    setSession(getToken(), data.user);
    return data.user;
  }
  async function logout() {
    clearSession();
    if (typeof Storage !== 'undefined' && Storage.setTier) Storage.setTier('free');
  }
  async function verifyWixInstance(instance) {
    const inst = instance || getWixInstanceFromUrl();
    if (!inst) return null;
    return api('/api/wix/verify', { method: 'POST', body: JSON.stringify({ instance: inst }) });
  }
  async function startCheckout(plan) {
    const data = await api('/api/stripe/checkout', { method: 'POST', body: JSON.stringify({ plan: plan || 'pro' }) });
    if (data.url) window.location.href = data.url;
    return data;
  }
  async function openPortal() {
    const data = await api('/api/stripe/portal', { method: 'POST', body: '{}' });
    if (data.url) window.location.href = data.url;
    return data;
  }
  return { getToken: getToken, getUser: getUser, isLoggedIn: isLoggedIn, register: register, login: login, me: me, logout: logout, verifyWixInstance: verifyWixInstance, startCheckout: startCheckout, openPortal: openPortal, getWixInstanceFromUrl: getWixInstanceFromUrl };
})();
