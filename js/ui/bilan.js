// "Mes progrès": headline numbers, evolution charts (from the answer log), per-notion analytics,
// badges, data export/import.
(function () {
  'use strict';
  if (typeof document === 'undefined') return;
  const M = globalThis.M;
  const UI = M.ui, P = M.progress;
  const { fmt, today, addDays, diffDays } = M.u;
  const { byId } = M.cat;

  let grain = null; // 'day' | 'week' — chosen by the viewer, default from data span

  // ---------- Aggregation ----------
  const mondayOf = d => { const x = new Date(d); const wd = (x.getDay() + 6) % 7; return today(new Date(x.getFullYear(), x.getMonth(), x.getDate() - wd)); };
  function buckets(log, g) {
    const span = g === 'week' ? 12 : 21;
    const end = g === 'week' ? mondayOf(Date.now()) : today();
    const keys = Array.from({ length: span }, (_, i) => addDays(end, -(span - 1 - i) * (g === 'week' ? 7 : 1)));
    const map = Object.fromEntries(keys.map(k => [k, []]));
    log.forEach(e => { const k = g === 'week' ? mondayOf(e[0]) : P.dayOf(e[0]); if (map[k]) map[k].push(e); });
    return keys.map(k => {
      const es = map[k], okMs = es.filter(e => e[3]).map(e => e[4]).filter(ms => ms > 0);
      const [y, m, d] = k.split('-');
      return {
        key: k, label: `${d}/${m}`, full: g === 'week' ? `semaine du ${d}/${m}/${y}` : `${d}/${m}/${y}`,
        count: es.length,
        rate: es.length ? Math.round((100 * es.filter(e => e[3]).length) / es.length) : null,
        time: okMs.length ? Math.round(P.median(okMs) / 100) / 10 : null,
      };
    });
  }

  // ---------- Single-series SVG chart (bar or line) with hover tooltip ----------
  function chart(points, { type, yMax, unit = '', label }) {
    const W = 900, H = 220, L = 40, R = 10, T = 12, B = 26, iw = W - L - R, ih = H - T - B;
    const max = yMax || Math.max(1, ...points.map(p => p.v || 0));
    const nice = (() => { const s = 10 ** Math.floor(Math.log10(max)); return Math.ceil(max / s) * s; })();
    const top = yMax || nice;
    const band = iw / points.length, X = i => L + band * (i + 0.5), Y = v => T + ih - (v / top) * ih;
    let g = '';
    for (let i = 0; i <= 4; i++) {
      const v = (top / 4) * i, y = Y(v);
      g += `<line x1="${L}" x2="${W - R}" y1="${y}" y2="${y}" class="gridline"/><text x="${L - 6}" y="${y + 4}" text-anchor="end" class="axis-label">${fmt(Math.round(v * 10) / 10)}</text>`;
    }
    const every = Math.ceil(points.length / 12);
    points.forEach((p, i) => { if (i % every === 0 || i === points.length - 1) g += `<text x="${X(i)}" y="${H - 6}" text-anchor="middle" class="axis-label">${p.label}</text>`; });
    let marks = '';
    if (type === 'bar') {
      const bw = Math.min(28, band * 0.6);
      points.forEach((p, i) => {
        if (!p.v) return;
        const x = X(i) - bw / 2, y = Y(p.v), h = T + ih - y, r = Math.min(4, h);
        marks += `<path class="bar-mark" d="M${x},${T + ih} V${y + r} Q${x},${y} ${x + r},${y} H${x + bw - r} Q${x + bw},${y} ${x + bw},${y + r} V${T + ih} Z"/>`;
      });
    } else {
      let seg = [];
      const flush = () => { if (seg.length > 1) marks += `<polyline class="line-mark" points="${seg.join(' ')}"/>`; seg = []; };
      points.forEach((p, i) => { if (p.v === null) flush(); else seg.push(`${X(i)},${Y(p.v)}`); });
      flush();
      points.forEach((p, i) => { if (p.v !== null) marks += `<circle class="dot-mark" cx="${X(i)}" cy="${Y(p.v)}" r="4"/>`; });
    }
    const hits = points.map((p, i) => `<rect class="hit" x="${L + band * i}" y="${T}" width="${band}" height="${ih}" data-i="${i}"/>`).join('');
    const tips = JSON.stringify(points.map((p, i) => ({ t: p.full, v: p.v === null ? '—' : `${fmt(p.v)}${unit}`, x: (X(i) / W) * 100, y: ((p.v === null ? T + ih : Y(p.v)) / H) * 100 })));
    return `<div class="chart" data-tips='${UI.esc(tips)}'><svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${UI.esc(label)}">${g}${marks}<line class="hover-rule" x1="0" x2="0" y1="${T}" y2="${T + ih}" visibility="hidden"/>${hits}</svg><div class="tooltip"></div></div>`;
  }
  function bindCharts(root) {
    root.querySelectorAll('.chart').forEach(c => {
      const tips = JSON.parse(c.dataset.tips), tip = c.querySelector('.tooltip'), rule = c.querySelector('.hover-rule');
      c.querySelectorAll('.hit').forEach(h => {
        h.addEventListener('mouseenter', () => {
          const t = tips[h.dataset.i], x = Number(h.getAttribute('x')) + Number(h.getAttribute('width')) / 2;
          tip.innerHTML = `${t.t}<br><b>${t.v}</b>`;
          tip.style.left = `${t.x}%`; tip.style.top = `${t.y}%`; tip.style.display = 'block';
          rule.setAttribute('x1', x); rule.setAttribute('x2', x); rule.setAttribute('visibility', 'visible');
        });
        h.addEventListener('mouseleave', () => { tip.style.display = 'none'; rule.setAttribute('visibility', 'hidden'); });
      });
    });
  }

  // ---------- Per-notion analytics ----------
  function notionStats(state) {
    const by = {};
    state.log.forEach(e => (by[e[1]] = by[e[1]] || []).push(e));
    return M.cat.list.filter(no => by[no.id]).map(no => {
      const es = by[no.id], last = es.slice(-10), prev = es.slice(-20, -10);
      const rate = arr => (arr.length ? Math.round((100 * arr.filter(e => e[3]).length) / arr.length) : null);
      const okMs = es.filter(e => e[3] && e[4] > 0).map(e => e[4]);
      return { no, n: es.length, rate: rate(es), last: rate(last), prev: rate(prev), time: okMs.length ? P.median(okMs) / 1000 : null, lastAt: es[es.length - 1][0] };
    });
  }
  const trend = s => {
    if (s.prev === null) return '<span class="muted">—</span>';
    const d = s.last - s.prev;
    return d > 5 ? `<span class="trend-up">▲ +${d} pts</span>` : d < -5 ? `<span class="trend-down">▼ ${d} pts</span>` : '<span class="muted">= stable</span>';
  };
  const ago = at => { const d = diffDays(P.dayOf(at), today()); return d === 0 ? 'aujourd’hui' : d === 1 ? 'hier' : `il y a ${d} j`; };

  UI.route('bilan', () => {
    const state = M.store.read(), log = state.log;
    const total = log.length, okN = log.filter(e => e[3]).length;
    const spanDays = total ? diffDays(P.dayOf(log[0][0]), today()) : 0;
    const g = grain || (spanDays > 21 ? 'week' : 'day');
    const bk = buckets(log, g);
    const stats = notionStats(state);
    const badges = P.badges(state);
    const persistent = M.store.isPersistent();

    const dataTable = `<details><summary>Voir les données en tableau</summary><table class="data"><thead><tr><th>${g === 'week' ? 'Semaine' : 'Jour'}</th><th>Questions</th><th>Réussite</th><th>Temps médian</th></tr></thead><tbody>
      ${bk.filter(b => b.count).map(b => `<tr><td>${b.full}</td><td class="n">${b.count}</td><td class="n">${b.rate} %</td><td class="n">${b.time === null ? '—' : fmt(b.time) + ' s'}</td></tr>`).join('') || '<tr><td colspan="4" class="empty">Pas encore de données.</td></tr>'}</tbody></table></details>`;

    const root = UI.render(`
      <h1>📈 Mes progrès</h1>
      <div class="grid grid-3">
        <div class="card stat"><b>${fmt(total)}</b>réponses</div>
        <div class="card stat"><b>${total ? Math.round((100 * okN) / total) : 0} %</b>réussies du premier coup</div>
        <div class="card stat"><b>🔥 ${P.streak(state.days)}</b>jours d’affilée (record : ${P.longestStreak(state.days)})</div>
      </div>

      <h2>Évolution</h2>
      <div class="row" style="margin-bottom:10px">
        <button class="chip" data-g="day" aria-pressed="${g === 'day'}">Par jour (3 semaines)</button>
        <button class="chip" data-g="week" aria-pressed="${g === 'week'}">Par semaine (12 semaines)</button>
      </div>
      ${total ? `<div class="grid">
        <div class="card chart-card"><h3>Questions répondues</h3><div class="sub">Nombre de réponses par ${g === 'week' ? 'semaine' : 'jour'}</div>${chart(bk.map(b => ({ ...b, v: b.count })), { type: 'bar', label: 'Questions répondues' })}</div>
        <div class="card chart-card"><h3>Réussite du premier coup</h3><div class="sub">En %, plus c’est haut, mieux c’est</div>${chart(bk.map(b => ({ ...b, v: b.rate })), { type: 'line', yMax: 100, unit: ' %', label: 'Taux de réussite' })}</div>
        <div class="card chart-card"><h3>Temps de réponse</h3><div class="sub">Temps médian d’une bonne réponse, en secondes (plus c’est bas, plus c’est automatique)</div>${chart(bk.map(b => ({ ...b, v: b.time })), { type: 'line', unit: ' s', label: 'Temps médian de réponse' })}</div>
      </div>${dataTable}` : '<p class="empty">Les graphiques apparaîtront dès les premières réponses.</p>'}

      <h2>Par notion</h2>
      ${stats.length ? M.cat.tree.map(d => {
        const rows = stats.filter(s => s.no.domain === d);
        if (!rows.length) return '';
        return `<div class="card" style="margin-bottom:12px"><h3>${d.icon} ${d.title}</h3><div style="overflow-x:auto"><table class="data">
          <thead><tr><th>Notion</th><th>Statut</th><th>Niv.</th><th class="n">Réponses</th><th class="n">Réussite</th><th>Tendance</th><th class="n">Temps médian</th><th>Dernière fois</th></tr></thead><tbody>
          ${rows.map(s => `<tr><td><a href="#/lecon/${s.no.id}">${s.no.num} ${s.no.title}</a></td><td>${UI.statusHtml(UI.notionStatus(state, s.no))} ${UI.starsHtml(UI.notionStars(state, s.no))}</td>
            <td class="n">${state.notions[s.no.id] ? state.notions[s.no.id].level : 1}</td><td class="n">${s.n}</td><td class="n">${s.rate} %</td><td>${trend(s)}</td>
            <td class="n">${s.time === null ? '—' : fmt(Math.round(s.time * 10) / 10) + ' s'}</td><td>${ago(s.lastAt)}</td></tr>`).join('')}
          </tbody></table></div><small>Tendance : réussite des 10 dernières réponses comparée aux 10 précédentes.</small></div>`;
      }).join('') : '<p class="empty">Aucune notion travaillée pour l’instant.</p>'}

      <h2>Badges</h2>
      <div class="badges">${badges.map(b => `<div class="badge ${b.earned ? '' : 'off'}"><span class="ic">${b.icon}</span><div><b>${b.title}</b><small>${b.desc}</small></div></div>`).join('')}</div>

      <h2>Bilan de départ</h2>
      <div class="row">${M.cat.tree.map(d => `<a class="btn" href="#/diagnostic/${d.id}">🧭 ${d.title} ${P.diagDone(state, d) ? '✓' : ''}</a>`).join('')}</div>

      <h2>Données</h2>
      <div class="card">
        <p>${persistent ? 'Les progrès sont enregistrés dans ce navigateur.' : '⚠️ Le navigateur n’autorise pas l’enregistrement : les progrès seront perdus à la fermeture de la page.'}
          <b>Attention :</b> ils sont liés à l’emplacement du dossier de l’application. Si tu déplaces le dossier ou changes de navigateur, fais d’abord une sauvegarde, puis restaure-la.</p>
        <div class="row">
          <button class="btn primary" data-act="csv">📊 Exporter les réponses (CSV, pour Excel)</button>
          <button class="btn" data-act="json">💾 Sauvegarder les progrès</button>
          <label class="btn">📂 Restaurer une sauvegarde<input type="file" accept=".json,application/json" data-act="import" hidden></label>
          <span class="spacer"></span>
          <button class="btn danger" data-act="reset">🗑️ Tout effacer</button>
        </div>
        <p id="data-msg" class="muted" role="status"></p>
      </div>`);

    bindCharts(root);
    root.querySelectorAll('[data-g]').forEach(b => b.addEventListener('click', () => { grain = b.dataset.g; UI.navigate(); }));
    const msg = t => { root.querySelector('#data-msg').textContent = t; };
    const stamp = today();
    root.querySelector('[data-act=csv]').addEventListener('click', () => { M.ui.download(`maths6e-reponses-${stamp}.csv`, M.store.exportCSV(), 'text/csv;charset=utf-8'); msg('Fichier CSV téléchargé : une ligne par réponse (date, notion, niveau, correct, temps, mode).'); });
    root.querySelector('[data-act=json]').addEventListener('click', () => { M.ui.download(`maths6e-sauvegarde-${stamp}.json`, M.store.exportJSON(), 'application/json'); msg('Sauvegarde téléchargée.'); });
    root.querySelector('[data-act=import]').addEventListener('change', async e => {
      const f = e.target.files[0];
      if (!f) return;
      try { M.store.importJSON(await f.text()); UI.navigate(); UI.announce('Sauvegarde restaurée.'); }
      catch (err) { msg('Impossible de restaurer : ' + (err.message || 'fichier invalide') + '.'); }
    });
    // Two-step reset, no browser dialog.
    const reset = root.querySelector('[data-act=reset]');
    reset.addEventListener('click', () => {
      if (reset.dataset.armed) { M.store.reset(); UI.navigate(); return; }
      reset.dataset.armed = '1';
      reset.textContent = '⚠️ Confirmer : tout effacer ?';
      setTimeout(() => { if (reset.isConnected) { delete reset.dataset.armed; reset.textContent = '🗑️ Tout effacer'; } }, 5000);
    });
  });
})();
