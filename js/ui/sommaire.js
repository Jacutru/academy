// Sommaire: Domaine → Chapitre → Notion, with search and status filter.
(function () {
  'use strict';
  if (typeof document === 'undefined') return;
  const M = globalThis.M;
  const P = M.progress, UI = M.ui;
  const { norm } = M.u;

  let query = '', filter = 'all';   // kept while the app is open
  const FILTERS = [['all', 'Toutes'], ['weak', '🔴 À revoir'], ['fragile', '🟡 Fragiles'], ['mastered', '✅ Acquises'], ['new', '⚪ Non évaluées']];

  function notionRow(state, no) {
    const st = UI.notionStatus(state, no);
    return `<div class="notion-row" data-status="${st}" data-search="${UI.esc(norm(`${no.num} ${no.title} ${no.chapter.title}`))}">
      <span class="num">${no.num}</span>
      <span class="title"><a href="#/lecon/${no.id}">${no.title}</a> <span class="tag">${no.niveau}</span></span>
      ${UI.starsHtml(UI.notionStars(state, no))}
      ${UI.statusHtml(st)}
      <span class="acts">
        <a class="btn small" href="#/lecon/${no.id}">📖 Leçon</a>
        <a class="btn small primary" href="#/exercice/${no.id}">✏️ S’entraîner</a>
        ${no.chrono ? `<a class="btn small" href="#/chrono/${no.id}" title="Chrono 60 s">⚡</a>` : ''}
      </span>
    </div>`;
  }

  UI.route('sommaire', () => {
    const state = M.store.read();
    UI.render(`
      <h1>📚 Sommaire</h1>
      <p class="muted">Tout le programme à maîtriser à la fin de la 6ème. Clique sur une notion pour lire la leçon, ou entraîne-toi directement.</p>
      <div class="toolbar">
        <input type="search" id="q" placeholder="Rechercher une notion (ex : fraction, aire, virgule…)" value="${UI.esc(query)}" aria-label="Rechercher une notion">
        ${FILTERS.map(([k, l]) => `<button class="chip" data-f="${k}" aria-pressed="${filter === k}">${l}</button>`).join('')}
      </div>
      <div id="tree">
        ${M.cat.tree.map(d => {
          const p = P.domainProgress(state, d);
          return `<section class="dom">
            <div class="dom-head"><h2>${d.num}. ${d.icon} ${d.title}</h2>${UI.barHtml(p.pct)}<span class="muted">${p.pct} %</span>
              <span class="spacer"></span><a class="btn small" href="#/diagnostic/${d.id}">🧭 ${P.diagDone(state, d) ? 'Refaire le bilan' : 'Faire le bilan'}</a></div>
            ${d.chapters.map(ch => `<div class="chapter"><h3 class="chap">${ch.num} ${ch.title}</h3>${ch.notions.map(no => notionRow(state, no)).join('')}</div>`).join('')}
          </section>`;
        }).join('')}
      </div>
      <p id="none" class="empty" hidden>Aucune notion ne correspond.</p>`);

    const apply = () => {
      const q = norm(query.trim());
      let any = false;
      document.querySelectorAll('.notion-row').forEach(r => {
        const show = (!q || r.dataset.search.includes(q)) && (filter === 'all' || r.dataset.status === filter);
        r.hidden = !show; any = any || show;
      });
      document.querySelectorAll('.chapter').forEach(c => { c.hidden = ![...c.querySelectorAll('.notion-row')].some(r => !r.hidden); });
      document.querySelectorAll('.dom').forEach(d => { d.hidden = ![...d.querySelectorAll('.notion-row')].some(r => !r.hidden); });
      document.getElementById('none').hidden = any;
    };
    const input = document.getElementById('q');
    input.addEventListener('input', () => { query = input.value; apply(); });
    document.querySelectorAll('.chip').forEach(b => b.addEventListener('click', () => {
      filter = b.dataset.f;
      document.querySelectorAll('.chip').forEach(x => x.setAttribute('aria-pressed', x === b));
      apply();
    }));
    UI.onKey(e => {
      if (e.key === '/' && document.activeElement !== input) { e.preventDefault(); input.focus(); return true; }
      if (e.key === 'Escape' && document.activeElement === input) { input.value = ''; query = ''; apply(); return true; }
      return false;
    });
    apply();
  });
})();
