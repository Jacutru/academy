// UI core: hash router, view lifecycle, keyboard dispatch, modal, small render helpers.
(function () {
  'use strict';
  if (typeof document === 'undefined') return;
  const M = globalThis.M;
  const P = M.progress;

  const app = document.getElementById('app');
  const routes = [];
  let teardown = null, keyHandler = null;

  // route('lecon/:id', params => …)
  const route = (pattern, view) => {
    const keys = [];
    const re = new RegExp('^' + pattern.replace(/:(\w+)/g, (_, k) => { keys.push(k); return '([^/]+)'; }) + '$');
    routes.push({ re, keys, view });
  };

  function navigate() {
    if (teardown) { try { teardown(); } catch (e) { console.error(e); } }
    teardown = null; keyHandler = null;
    closeModal();
    const raw = location.hash.replace(/^#\/?/, '');
    let path;
    try { path = decodeURIComponent(raw); } catch (e) { path = raw; }   // malformed %-escape
    const r = routes.find(x => x.re.test(path)) || routes.find(x => x.re.test(''));
    const m = r.re.exec(path) || [];
    const params = Object.fromEntries(r.keys.map((k, i) => [k, m[i + 1]]));
    document.querySelectorAll('[data-nav]').forEach(a => a.classList.toggle('active', path.startsWith(a.dataset.nav)));
    window.scrollTo(0, 0);
    if (!M.store.read().name) M.ui.welcome(); else r.view(params);
    if (!app.contains(document.activeElement)) app.focus({ preventScroll: true });
  }

  // A view renders HTML and may register a teardown and a key handler.
  const render = html => { app.innerHTML = html; return app; };
  const onLeave = fn => { teardown = fn; };
  const onKey = fn => { keyHandler = fn; };

  document.addEventListener('keydown', e => {
    const modal = document.getElementById('modal');
    if (modal.open) { if (e.key === 'Escape') { e.preventDefault(); closeModal(); } return; }
    if (keyHandler && keyHandler(e) === true) return;
    if (e.key === 'Escape' && !e.target.matches('input[type=search]')) location.hash = '#/sommaire';
  });

  // ---------- Modal (lesson during practice) ----------
  const modal = document.getElementById('modal');
  modal.querySelector('.modal-close').addEventListener('click', () => closeModal());
  modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });
  let modalReturn = null;
  function openModal(html, onClose) {
    modal.querySelector('.modal-body').innerHTML = html;
    modalReturn = onClose || null;
    if (!modal.open) modal.showModal();
  }
  function runModalReturn() { const fn = modalReturn; modalReturn = null; if (fn) fn(); }
  // Native closes (Escape/cancel, Android back) bypass closeModal: still resume the exercise timer.
  modal.addEventListener('close', runModalReturn);
  function closeModal() {
    if (!modal.open) return;
    modal.close();
    runModalReturn();
  }

  // ---------- Helpers ----------
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const announce = text => { const l = document.getElementById('live'); l.textContent = ''; setTimeout(() => { l.textContent = text; }, 30); };
  const STATUS = {
    new: { icon: '⚪', label: 'Pas encore évalué' },
    weak: { icon: '🔴', label: 'À revoir' },
    fragile: { icon: '🟡', label: 'Fragile' },
    mastered: { icon: '✅', label: 'Acquis' },
  };
  const statusHtml = s => `<span class="status" title="${STATUS[s].label}">${STATUS[s].icon} ${STATUS[s].label}</span>`;
  const starsHtml = n => `<span class="stars" aria-label="${n} étoile${n > 1 ? 's' : ''} sur 3">${'★'.repeat(n)}<span class="off">${'★'.repeat(3 - n)}</span></span>`;
  const barHtml = pct => `<div class="bar" role="progressbar" aria-valuenow="${pct}" aria-valuemin="0" aria-valuemax="100"><span style="width:${pct}%"></span></div>`;
  function download(filename, text, mime) {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([text], { type: mime }));
    a.download = filename;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  }
  const notionStatus = (state, no) => P.statusOf(state, no);
  // Class tag of a notion in the pupil's chosen programme ("+" when outside it).
  function levelTag(state, no) {
    const lv = M.programmes.levelIn(state.target.version, no.id);
    return lv === M.programmes.HORS ? '<span class="tag tag-plus" title="Hors programme : pour aller plus loin">+</span>' : `<span class="tag">${lv}</span>`;
  }
  const targetLabel = state => `${state.target.classe} · ${M.programmes.byId(state.target.version).label}`;
  const notionStars = (state, no) => P.stars(state.notions[no.id], no);

  M.ui = { route, navigate, render, onLeave, onKey, openModal, closeModal, esc, announce, STATUS, statusHtml, starsHtml, barHtml, download, notionStatus, notionStars, levelTag, targetLabel };
})();
