// Start-up: storage banner, cross-tab refresh, router.
(function () {
  'use strict';
  if (typeof document === 'undefined') return;
  const M = globalThis.M;

  if (!M.store.isPersistent()) {
    const b = document.getElementById('banner');
    b.textContent = '⚠️ Ce navigateur n’autorise pas l’enregistrement : tes progrès seront perdus en fermant la page. Pense à les sauvegarder (page Progrès).';
    b.hidden = false;
  }
  // Progress changed in another tab: refresh passive pages when this tab comes back into view
  // (never while the pupil is using it, never during an exercise).
  let stale = false;
  window.addEventListener('storage', e => { if (e.key === M.store.KEY) stale = true; });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden || !stale) return;
    stale = false;
    if (/^#\/?(sommaire|bilan)?$/.test(location.hash || '#/')) M.ui.navigate();
  });
  window.addEventListener('hashchange', M.ui.navigate);
  // Offline support when served over http(s) (e.g. GitHub Pages); not available from file://.
  if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
    navigator.serviceWorker.register('sw.js').catch(e => console.warn('Service worker non installé :', e));
  }
  M.ui.navigate();
})();
