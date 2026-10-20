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

  // ---------- Subject (per tab) ----------
  // A page about a notion, chapter or domain belongs to its subject: deep links switch to it.
  const subject = () => M.cat.subjectById(M.store.subject());
  function showSubject() {
    const s = subject();
    document.body.dataset.subject = s.id;
    document.getElementById('brand-icon').textContent = s.icon;
    document.querySelectorAll('[data-subject-btn]').forEach(b => b.setAttribute('aria-pressed', b.dataset.subjectBtn === s.id));
  }
  const switcher = document.getElementById('subjects');
  switcher.innerHTML = M.cat.subjects.map(s => `<button class="chip" data-subject-btn="${s.id}" aria-pressed="false" title="${s.title}">${s.icon} <span class="label">${s.title}</span></button>`).join('');
  switcher.addEventListener('click', e => {
    const b = e.target.closest('[data-subject-btn]');
    if (!b || b.dataset.subjectBtn === subject().id) return;
    M.store.setSubject(b.dataset.subjectBtn);
    // A page tied to one notion/chapter of the other subject makes no sense any more: go to the Sommaire.
    if (/^#\/?[^/]+\/./.test(location.hash)) location.hash = '#/sommaire'; else navigate();
  });

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
    const owner = M.cat.subjectOf(params.id || params.dom || '');
    if (owner) M.store.setSubject(owner.id);
    showSubject();
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
    weak: { icon: '🔴', label: 'À revoir', span: 'moins de 80 %' },
    average: { icon: '🟠', label: 'Moyen', span: '80 % et plus' },
    good: { icon: '🟢', label: 'Bien', span: '90 % et plus' },
    excellent: { icon: '🌟', label: 'Excellent', span: '98 % et plus' },
  };
  // Coloured pill (icon + label, never colour alone), with the success rate when known.
  function statusHtml(s, rate) {
    const pct = rate === null || rate === undefined || rate.n < 3 ? '' : ` · ${Math.round(rate.value * 100)} %`;   // a rate on 1–2 answers would contradict the spans
    return `<span class="status st-${s}" title="${STATUS[s].label}${STATUS[s].span ? ` : ${STATUS[s].span} de réussite sur les 10 dernières réponses` : ''}">${STATUS[s].icon} ${STATUS[s].label}${pct}</span>`;
  }
  const notionStatusHtml = (state, no, st = P.statusOf(state, no)) => { const np = state.notions[no.id]; return statusHtml(st, np && np.hist.length ? { value: P.successRate(np), n: Math.min(np.hist.length, P.WINDOW) } : null); };
  const legendHtml = () => `<p class="legend">${['weak', 'average', 'good', 'excellent'].map(s => `<span class="status st-${s}">${STATUS[s].icon} ${STATUS[s].label} : ${STATUS[s].span}</span>`).join(' ')} <small>(sur les 10 dernières réponses ; « Excellent » demande aussi le niveau 3 et au moins 5 réponses)</small></p>`;
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
    const lv = M.programmes.levelIn(M.programmes.versionFor(state.target, no.subject.id), no.id);
    return lv === M.programmes.HORS ? '<span class="tag tag-plus" title="Hors programme : pour aller plus loin">+</span>' : `<span class="tag">${lv}</span>`;
  }
  const targetLabel = state => `${state.target.classe} · ${M.programmes.byId(M.programmes.versionFor(state.target, subject().id)).label}`;
  // A link to a notion; one of another subject than the current one shows that subject's icon.
  const notionLink = no => `<a href="#/lecon/${no.id}">${no.subject === subject() ? '' : no.subject.icon + ' '}${no.num} ${no.title}</a>`;
  const notionStars = (state, no) => P.stars(state.notions[no.id], no);

  M.ui = { subject, notionLink, route, navigate, render, onLeave, onKey, openModal, closeModal, esc, announce, STATUS, statusHtml, starsHtml, barHtml, download, notionStatus, notionStatusHtml, legendHtml, notionStars, levelTag, targetLabel };
})();
