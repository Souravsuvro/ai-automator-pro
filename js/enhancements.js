/** v1.4 — auth UI hooks, Stripe checkout, Wix verify, demo DNA */
(function () {
  function whenReady(fn) {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn);
    else fn();
  }
  whenReady(function () {
    if (typeof App === 'undefined') return;
    if (typeof Storage !== 'undefined' && Storage.getDemoProfile && !App.loadDemo) {
      App.loadDemo = function () {
        Storage.saveProfile(Storage.getDemoProfile());
        if (App.navigate) App.navigate('dashboard');
        else location.reload();
      };
    }
    App.login = async function (email, password) {
      if (typeof Auth === 'undefined') throw new Error('Auth module missing');
      const user = await Auth.login(email, password);
      if (App.toast) App.toast('Signed in as ' + user.email);
      if (App.navigate) App.navigate('dashboard');
      return user;
    };
    App.register = async function (email, password, name) {
      if (typeof Auth === 'undefined') throw new Error('Auth module missing');
      const user = await Auth.register(email, password, name);
      if (App.toast) App.toast('Account created');
      if (App.navigate) App.navigate('dashboard');
      return user;
    };
    App.logout = async function () {
      if (typeof Auth !== 'undefined') await Auth.logout();
      if (App.toast) App.toast('Signed out');
      if (App.navigate) App.navigate('home');
    };
    App.checkout = async function (plan) {
      if (typeof Auth === 'undefined') throw new Error('Auth module missing');
      if (!Auth.isLoggedIn()) {
        if (App.navigate) App.navigate('auth');
        if (App.toast) App.toast('Sign in to upgrade', 'error');
        return;
      }
      try { await Auth.startCheckout(plan); } catch (e) { if (App.toast) App.toast(e.message || 'Checkout failed', 'error'); }
    };
    App.billingPortal = async function () {
      try { await Auth.openPortal(); } catch (e) { if (App.toast) App.toast(e.message || 'Portal unavailable', 'error'); }
    };
    var origNavigate = App.navigate;
    if (origNavigate) {
      App.navigate = function (view, data) {
        if (view === 'auth') {
          var main = document.getElementById('main');
          if (!main) return;
          main.innerHTML = '<div class="max-w-md mx-auto px-4 py-14"><div class="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm"><h1 class="text-2xl font-bold text-slate-900 mb-2">Sign in</h1><p class="text-sm text-slate-600 mb-6">Sync your plan across devices and Wix sites.</p><label class="block text-sm font-medium mb-1">Email</label><input id="auth-email" type="email" class="w-full border rounded-lg px-3 py-2 mb-3 text-sm" placeholder="you@business.com"/><label class="block text-sm font-medium mb-1">Password</label><input id="auth-password" type="password" class="w-full border rounded-lg px-3 py-2 mb-4 text-sm" placeholder="Min 8 characters"/><div class="flex flex-col gap-2"><button id="auth-login-btn" class="bg-brand-600 text-white font-semibold py-2.5 rounded-lg">Sign in</button><button id="auth-register-btn" class="border border-slate-300 font-semibold py-2.5 rounded-lg">Create account</button></div><p class="text-xs text-slate-500 mt-4">Wix embeds pass an <code>instance</code> param — verified when WIX_APP_SECRET is set.</p></div></div>';
          document.getElementById('auth-login-btn').onclick = async function () {
            try { await App.login(document.getElementById('auth-email').value.trim(), document.getElementById('auth-password').value); } catch (e) { if (App.toast) App.toast(e.message, 'error'); }
          };
          document.getElementById('auth-register-btn').onclick = async function () {
            try { await App.register(document.getElementById('auth-email').value.trim(), document.getElementById('auth-password').value, ''); } catch (e) { if (App.toast) App.toast(e.message, 'error'); }
          };
          return;
        }
        return origNavigate(view, data);
      };
    }
    var obs = new MutationObserver(function () {
      var main = document.getElementById('main');
      if (!main) return;
      if (typeof Storage !== 'undefined' && !Storage.getProfile() && !main.querySelector('[data-demo-btn]')) {
        var hero = main.querySelector('.gradient-bg');
        if (hero) {
          var heroBtns = hero.querySelector('.flex.flex-col');
          if (heroBtns) {
            var b = document.createElement('button');
            b.setAttribute('data-demo-btn', '1');
            b.className = 'w-full sm:w-auto bg-white/10 hover:bg-white/20 border border-white/30 text-white font-semibold px-8 py-3.5 rounded-xl transition text-base';
            b.textContent = 'Try with demo data';
            b.onclick = function () { App.loadDemo && App.loadDemo(); };
            heroBtns.appendChild(b);
          }
        }
      }
      main.querySelectorAll('[data-checkout]').forEach(function (el) {
        if (el._wired) return;
        el._wired = true;
        el.addEventListener('click', function (e) {
          e.preventDefault();
          App.checkout(el.getAttribute('data-checkout') || 'pro');
        });
      });
    });
    obs.observe(document.getElementById('main') || document.body, { childList: true, subtree: true });
    var nav = document.querySelector('header nav');
    if (nav && !document.getElementById('btn-auth')) {
      var authBtn = document.createElement('button');
      authBtn.id = 'btn-auth';
      authBtn.className = 'text-sm text-slate-600 hover:text-brand-600';
      function refreshAuthBtn() {
        var logged = typeof Auth !== 'undefined' && Auth.isLoggedIn();
        authBtn.textContent = logged ? 'Account' : 'Sign in';
        authBtn.onclick = function () {
          if (logged) { if (confirm('Sign out?')) App.logout(); }
          else if (App.navigate) App.navigate('auth');
        };
      }
      refreshAuthBtn();
      nav.insertBefore(authBtn, nav.firstChild);
      setInterval(refreshAuthBtn, 2000);
    }
    if (typeof Auth !== 'undefined' && Auth.getWixInstanceFromUrl()) {
      Auth.verifyWixInstance().then(function (r) {
        if (r && r.instanceId) console.info('[AAP] Wix instance', r.verified ? 'verified' : 'decoded', r.instanceId);
      }).catch(function () {});
    }
    if (typeof Auth !== 'undefined' && Auth.isLoggedIn()) {
      Auth.me().then(function (u) {
        if (u && u.tier && typeof Storage !== 'undefined' && Storage.setTier) Storage.setTier(u.tier);
      }).catch(function () {});
    }
    try {
      var params = new URLSearchParams(location.search);
      if (params.get('billing') === 'success' && App.toast) {
        App.toast('Subscription updated — refresh if tier still shows Free');
        if (typeof Auth !== 'undefined' && Auth.isLoggedIn()) Auth.me().catch(function () {});
      }
    } catch (_) {}
  });
})();
