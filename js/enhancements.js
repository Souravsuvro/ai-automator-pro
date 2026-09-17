/** v1.3 enhancements — demo DNA if core App already loaded */
(function () {
  function whenReady(fn) {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn);
    else fn();
  }
  whenReady(function () {
    if (typeof App === 'undefined' || typeof Storage === 'undefined') return;
    if (!App.loadDemo && Storage.getDemoProfile) {
      App.loadDemo = function () {
        Storage.saveProfile(Storage.getDemoProfile());
        if (App.navigate) App.navigate('dashboard');
        else location.reload();
      };
    }
    var obs = new MutationObserver(function () {
      var main = document.getElementById('main');
      if (!main || Storage.getProfile()) return;
      if (main.querySelector('[data-demo-btn]')) return;
      var hero = main.querySelector('.gradient-bg');
      if (!hero) return;
      var heroBtns = hero.querySelector('.flex.flex-col');
      if (!heroBtns) return;
      var b = document.createElement('button');
      b.setAttribute('data-demo-btn', '1');
      b.className = 'w-full sm:w-auto bg-white/10 hover:bg-white/20 border border-white/30 text-white font-semibold px-8 py-3.5 rounded-xl transition text-base';
      b.textContent = 'Try with demo data';
      b.onclick = function () { App.loadDemo && App.loadDemo(); };
      heroBtns.appendChild(b);
    });
    obs.observe(document.getElementById('main') || document.body, { childList: true, subtree: true });
  });
})();
