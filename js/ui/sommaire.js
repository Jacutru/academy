// Sommaire: Domaine → Chapitre → Notion, with search and status filter.
(function () {
  'use strict';
  if (typeof document === 'undefined') return;
  const M = globalThis.M;
  const P = M.progress, UI = M.ui;
  const { norm } = M.u;

  let query = '', filter = 'all', scope = 'all';   // kept while the app is open
  const SCOPES = [['all', 'Toutes'], ['mine', '🎯 Mon programme'], ['apres', '⏭️ Classes suivantes'], ['hors', '➕ Pour aller plus loin']];
  const relOf = (state, no) => M.programmes.relation(state.target, no.id);
  const scopeOk = rel => scope === 'all' || (scope === 'mine' ? rel === 'avant' || rel === 'cible' : rel === scope);
  // List or blocks ("pad") view: a per-viewer convenience, remembered in this browser only.
  const VIEW_KEY = 'academy.sommaireView';
  let view = (() => { try { return localStorage.getItem(VIEW_KEY) === 'blocks' ? 'blocks' : 'list'; } catch (e) { return 'list'; } })();
  const saveView = v => { view = v; try { localStorage.setItem(VIEW_KEY, v); } catch (e) { /* private mode: just not remembered */ } };

  // Same scope as the domain bars: only the lessons of the pupil's programme (target class and before).
  function chapterProgress(state, ch) {
    const ns = P.inScope(state, ch.notions), total = ns.length * 3, got = ns.reduce((s, no) => s + UI.notionStars(state, no), 0);
    return { got, total, pct: total ? Math.round((100 * got) / total) : 0 };
  }
  const starsText = p => (p.total ? `${p.got}/${p.total} ★` : 'hors de ton programme');
  const searchKey = no => norm(`${no.num} ${no.title} ${no.chapter.title}`);

  function chapterTile(state, ch) {
    const p = chapterProgress(state, ch);
    const items = ch.notions.map(no => [searchKey(no), UI.notionStatus(state, no), relOf(state, no)]);
    return `<a class="tile" href="#/chapitre/${ch.id}" data-items='${UI.esc(JSON.stringify(items))}'>
      <span class="tile-num">${ch.num}</span>
      <span class="tile-title">${ch.title}</span>
      <span class="tile-dots" aria-hidden="true">${items.map(([, st]) => UI.STATUS[st].icon).join('')}</span>
      ${UI.barHtml(p.pct)}
      <small><span class="tile-count">${ch.notions.length}</span> leçon${ch.notions.length > 1 ? 's' : ''} · ${starsText(p)}</small>
    </a>`;
  }

  function notionTile(state, no) {
    const st = UI.notionStatus(state, no);
    return `<div class="tile notion-tile">
      <span class="tile-num">${no.num}</span>
      <a class="tile-title" href="#/lecon/${no.id}">${no.title}</a>
      <span>${UI.levelTag(state, no)} ${UI.starsHtml(UI.notionStars(state, no))}</span>
      ${UI.statusHtml(st)}
      <span class="acts">
        <a class="btn small" href="#/lecon/${no.id}">📖 Leçon</a>
        <a class="btn small primary" href="#/exercice/${no.id}">✏️ S’entraîner</a>
        ${no.chrono ? `<a class="btn small" href="#/chrono/${no.id}" title="Chrono 60 s">⚡</a>` : ''}
      </span>
    </div>`;
  }
  const FILTERS = [['all', 'Toutes'], ['weak', '🔴 À revoir'], ['fragile', '🟡 Fragiles'], ['mastered', '✅ Acquises'], ['new', '⚪ Non évaluées']];

  function notionRow(state, no) {
    const st = UI.notionStatus(state, no);
    return `<div class="notion-row" data-status="${st}" data-rel="${relOf(state, no)}" data-search="${UI.esc(searchKey(no))}">
      <span class="num">${no.num}</span>
      <span class="title"><a href="#/lecon/${no.id}">${no.title}</a> ${UI.levelTag(state, no)}</span>
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
      <p class="muted">Objectif : <b>${UI.esc(UI.targetLabel(state))}</b> (<a href="#/bilan">changer</a>). Clique sur une notion pour lire la leçon, ou entraîne-toi directement.</p>
      <div class="toolbar">${SCOPES.map(([k, l]) => `<button class="chip" data-s="${k}" aria-pressed="${scope === k}">${l}</button>`).join('')}</div>
      <div class="toolbar">
        <input type="search" id="q" placeholder="Rechercher une notion (ex : fraction, aire, virgule…)" value="${UI.esc(query)}" aria-label="Rechercher une notion">
        ${FILTERS.map(([k, l]) => `<button class="chip" data-f="${k}" aria-pressed="${filter === k}">${l}</button>`).join('')}
        <span class="spacer"></span>
        <span class="seg" role="group" aria-label="Affichage">
          <button class="chip" data-view="list" aria-pressed="${view === 'list'}">☰ Liste</button>
          <button class="chip" data-view="blocks" aria-pressed="${view === 'blocks'}">▦ Blocs</button>
        </span>
      </div>
      <div id="tree">
        ${M.cat.tree.map(d => {
          const p = P.domainProgress(state, d);
          return `<section class="dom">
            <div class="dom-head"><h2>${d.num}. ${d.icon} ${d.title}</h2>${UI.barHtml(p.pct)}<span class="muted">${p.pct} %</span>
              <span class="spacer"></span><a class="btn small" href="#/diagnostic/${d.id}">🧭 ${P.diagDone(state, d) ? 'Refaire le bilan' : 'Faire le bilan'}</a></div>
            ${view === 'blocks'
              ? `<div class="tiles">${d.chapters.map(ch => chapterTile(state, ch)).join('')}</div>`
              : d.chapters.map(ch => `<div class="chapter"><h3 class="chap">${ch.num} ${ch.title}</h3>${ch.notions.map(no => notionRow(state, no)).join('')}</div>`).join('')}
          </section>`;
        }).join('')}
      </div>
      <p id="none" class="empty" hidden>Aucune notion ne correspond.</p>`);

    const apply = () => {
      const q = norm(query.trim());
      const match = (key, st, rel) => (!q || key.includes(q)) && (filter === 'all' || st === filter) && scopeOk(rel);
      let any = false;
      document.querySelectorAll('.notion-row').forEach(r => { r.hidden = !match(r.dataset.search, r.dataset.status, r.dataset.rel); any = any || !r.hidden; });
      // Blocks: a chapter tile stays visible if at least one of its lessons matches; it shows how many.
      document.querySelectorAll('.tile[data-items]').forEach(t => {
        const items = JSON.parse(t.dataset.items), n = items.filter(([k, st, rel]) => match(k, st, rel)).length;
        t.hidden = n === 0; any = any || n > 0;
        t.querySelector('.tile-count').textContent = q || filter !== 'all' || scope !== 'all' ? `${n}/${items.length}` : items.length;
      });
      document.querySelectorAll('.chapter').forEach(c => { c.hidden = ![...c.querySelectorAll('.notion-row')].some(r => !r.hidden); });
      document.querySelectorAll('.dom').forEach(d => { d.hidden = ![...d.querySelectorAll('.notion-row, .tile[data-items]')].some(r => !r.hidden); });
      document.getElementById('none').hidden = any;
    };
    const input = document.getElementById('q');
    input.addEventListener('input', () => { query = input.value; apply(); });
    document.querySelectorAll('[data-f]').forEach(b => b.addEventListener('click', () => {
      filter = b.dataset.f;
      document.querySelectorAll('[data-f]').forEach(x => x.setAttribute('aria-pressed', x === b));
      apply();
    }));
    document.querySelectorAll('[data-s]').forEach(b => b.addEventListener('click', () => {
      scope = b.dataset.s;
      document.querySelectorAll('[data-s]').forEach(x => x.setAttribute('aria-pressed', x === b));
      apply();
    }));
    document.querySelectorAll('[data-view]').forEach(b => b.addEventListener('click', () => { if (b.dataset.view !== view) { saveView(b.dataset.view); UI.navigate(); } }));
    UI.onKey(e => {
      if (e.key === '/' && document.activeElement !== input) { e.preventDefault(); input.focus(); return true; }
      if (e.key === 'Escape' && document.activeElement === input) { input.value = ''; query = ''; apply(); return true; }
      return false;
    });
    apply();
  });

  UI.route('chapitre/:id', ({ id }) => {
    const chapters = M.cat.tree.flatMap(d => d.chapters), i = chapters.findIndex(c => c.id === id);
    if (i < 0) { location.hash = '#/sommaire'; return; }
    const ch = chapters[i], state = M.store.read(), p = chapterProgress(state, ch);
    const prev = chapters[i - 1], next = chapters[i + 1];
    UI.render(`
      <div class="crumbs"><a href="#/sommaire">Sommaire</a> › ${ch.domain.icon} ${ch.domain.title}</div>
      <div class="dom-head"><h1 style="margin:0">${ch.num} ${ch.title}</h1>${UI.barHtml(p.pct)}<span class="muted">${starsText(p)}</span></div>
      <div class="tiles" style="margin-top:16px">${ch.notions.map(no => notionTile(state, no)).join('')}</div>
      <div class="row" style="margin-top:20px">
        ${prev ? `<a class="btn" href="#/chapitre/${prev.id}">← ${prev.num} ${prev.title}</a>` : ''}
        <span class="spacer"></span>
        ${next ? `<a class="btn" href="#/chapitre/${next.id}">${next.num} ${next.title} →</a>` : ''}
      </div>`);
  });
})();
