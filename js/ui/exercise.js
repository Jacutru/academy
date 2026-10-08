// Exercise runner: one view for free practice, daily session, diagnostic and chrono.
(function () {
  'use strict';
  if (typeof document === 'undefined') return;
  const M = globalThis.M;
  const UI = M.ui, A = M.answer, P = M.progress;
  const { byId, content, domains } = M.cat;

  const PRAISE = ['Bravo !', 'Excellent !', 'Parfait !', 'Super !', 'Bien joué !', 'Exactement !', 'Top !'];
  const pick = arr => arr[Math.floor(Math.random() * arr.length)];

  // ---------- Answer widgets ----------
  function widgetHtml(a) {
    switch (a.kind) {
      case 'number': case 'fraction': case 'duration':
        return `<div class="answer-row"><input type="text" id="in" autocomplete="off" spellcheck="false" inputmode="${a.kind === 'number' ? 'decimal' : 'text'}" aria-label="Ta réponse">${a.unit ? `<span class="unit">${a.unit}</span>` : ''}<button class="btn primary" data-act="ok">Valider <kbd>Entrée</kbd></button></div>`;
      case 'division':
        return `<div class="answer-row"><label>Quotient <input type="text" id="in" class="short" autocomplete="off" inputmode="numeric"></label><label>Reste <input type="text" id="in2" class="short" autocomplete="off" inputmode="numeric"></label><button class="btn primary" data-act="ok">Valider <kbd>Entrée</kbd></button></div>`;
      case 'choice':
        return `<div class="choices">${a.options.map((o, i) => `<button class="choice" data-i="${i}"><kbd>${i + 1}</kbd> ${o}</button>`).join('')}</div>`;
      case 'order':
        return `<div class="order-seq" id="seq" aria-live="polite"><span class="muted">Clique sur les nombres dans l’ordre…</span></div>
          <div class="choices">${a.items.map((o, i) => `<button class="choice" data-o="${i}"><kbd>${i + 1}</kbd> ${o}</button>`).join('')}</div>
          <div class="row" style="margin-top:10px"><button class="btn small" data-act="undo">↶ Effacer <kbd>⌫</kbd></button></div>`;
    }
  }

  function runView(run, { restart }) {
    let item = null, tries = 0, phase = 'answer', seq = [], streak = 0;
    let t0 = 0, hiddenMs = 0, hiddenSince = null, autoTimer = null, chronoTimer = null, chronoStart = 0;
    const isChrono = run.mode === 'chrono';

    // Timing excludes time spent with the tab hidden or the lesson open.
    const pause = () => { if (hiddenSince === null) hiddenSince = performance.now(); };
    const resume = () => { if (hiddenSince !== null) { hiddenMs += performance.now() - hiddenSince; hiddenSince = null; } };
    const now = () => performance.now() - hiddenMs - (hiddenSince !== null ? performance.now() - hiddenSince : 0);
    const onVis = () => (document.hidden ? pause() : resume());
    document.addEventListener('visibilitychange', onVis);
    UI.onLeave(() => {
      clearTimeout(autoTimer); clearInterval(chronoTimer); document.removeEventListener('visibilitychange', onVis);
      if (phase !== 'end') run.finish();   // left mid-run (Échap, link): still apply onFinish (e.g. diagnostic levels)
    });

    const root = UI.render(`
      <div class="ex-head">
        <h1>${run.title}</h1>
        <div class="ex-progress" id="prog"></div>
        <span class="ex-meta" id="meta"></span>
        <button class="btn small" data-act="stop">Terminer</button>
      </div>
      <div id="stage"></div>
      <div class="ex-foot" id="foot">
        <a href="#" data-act="lesson">📖 Revoir la leçon <kbd>L</kbd></a>
        <span><kbd>Entrée</kbd> valider / continuer</span>
        <span><kbd>Échap</kbd> quitter</span>
      </div>`);
    const stage = root.querySelector('#stage');
    root.querySelector('[data-act=stop]').addEventListener('click', end);
    root.querySelector('[data-act=lesson]').addEventListener('click', e => { e.preventDefault(); openLesson(); });

    function openLesson() {
      if (!item || isChrono) return;   // the lesson pauses timing: never during the 60 s chrono
      pause();
      UI.showLessonModal(item.id, () => { resume(); focusInput(); });
    }

    function header() {
      const total = run.total();
      if (isChrono) return;
      root.querySelector('#prog').innerHTML = total ? UI.barHtml(Math.round((100 * run.answered) / total)) : '';
      root.querySelector('#meta').textContent = total ? `${Math.min(run.answered + 1, total)} / ${total}` : `${run.correct} ✓ · ${run.answered} question${run.answered > 1 ? 's' : ''}${streak >= 3 ? ` · 🔥 ${streak}` : ''}`;
    }

    function startChrono() {
      chronoStart = now();
      const tick = () => {
        const left = Math.max(0, run.opts.timeLimit - (now() - chronoStart));
        root.querySelector('#meta').innerHTML = `<span class="timer ${left < 10000 ? 'low' : ''}">⏱ ${Math.ceil(left / 1000)} s</span> · ${run.correct} ✓`;
        root.querySelector('#prog').innerHTML = UI.barHtml(Math.round((100 * left) / run.opts.timeLimit));
        if (left <= 0) end();
      };
      tick();
      chronoTimer = setInterval(tick, 200);
    }

    function next() {
      clearTimeout(autoTimer);
      item = run.next();
      if (!item) return end();
      tries = 0; phase = 'answer'; seq = [];
      const no = byId[item.id], a = item.q.answer;
      stage.innerHTML = `<div class="card qcard">
        <div class="crumbs">${no.num} · ${no.title} · niveau ${item.level}${item.retry ? ' · 🔁 deuxième chance' : ''}</div>
        <div class="qprompt">${item.q.prompt}</div>
        ${widgetHtml(a)}
        <div class="fmt-hint">${A.hint(a)}</div>
        <div class="feedback" id="fb" role="status"></div>
      </div>`;
      bindWidget(a);
      header();
      t0 = now();
      focusInput();
    }

    function focusInput() {
      const el = stage.querySelector('#in') || stage.querySelector('.choice:not([disabled])');
      if (el) el.focus();
    }

    function bindWidget(a) {
      const ok = stage.querySelector('[data-act=ok]');
      if (ok) ok.addEventListener('click', () => submit(readInput()));
      stage.querySelectorAll('[data-i]').forEach(b => b.addEventListener('click', () => submit(Number(b.dataset.i))));
      stage.querySelectorAll('[data-o]').forEach(b => b.addEventListener('click', () => addOrder(Number(b.dataset.o))));
      const undo = stage.querySelector('[data-act=undo]');
      if (undo) undo.addEventListener('click', undoOrder);
      const in1 = stage.querySelector('#in'), in2 = stage.querySelector('#in2');
      if (in1 && in2) in1.addEventListener('keydown', e => { if (e.key === 'Enter' && !in2.value) { e.preventDefault(); e.stopPropagation(); in2.focus(); } });
    }

    function readInput() {
      const a = item.q.answer;
      if (a.kind === 'division') return { q: stage.querySelector('#in').value, r: stage.querySelector('#in2').value };
      if (a.kind === 'order') return seq.slice();
      return stage.querySelector('#in').value;
    }

    function addOrder(i) {
      if (phase !== 'answer' || seq.includes(i)) return;
      seq.push(i);
      drawOrder();
      if (seq.length === item.q.answer.items.length) submit(seq.slice());
    }
    function undoOrder() { if (phase === 'answer') { seq.pop(); drawOrder(); } }
    function drawOrder() {
      const a = item.q.answer;
      stage.querySelector('#seq').innerHTML = seq.length ? seq.map(i => a.items[i]).join(` <b>${a.sep}</b> `) : '<span class="muted">Clique sur les nombres dans l’ordre…</span>';
      stage.querySelectorAll('[data-o]').forEach(b => b.classList.toggle('picked', seq.includes(Number(b.dataset.o))));
    }

    function feedback(cls, html) {
      const fb = stage.querySelector('#fb');
      fb.className = `feedback show ${cls}`;
      fb.innerHTML = html;
      UI.announce(fb.textContent);
    }

    const singleTry = () => isChrono || run.mode === 'diag' || ['choice', 'order'].includes(item.q.answer.kind);

    function submit(input) {
      if (phase !== 'answer') return;
      const a = item.q.answer, res = A.check(a, input);
      if (res.status === 'invalid') { feedback('info', `🤔 ${res.msg}`); focusInput(); return; }
      tries++;
      const ok = res.status === 'ok';
      if (tries === 1) {
        // A retry repeats a question whose answer was just shown: it is not evidence of mastery.
        if (!item.retry) M.store.recordAnswer(item.id, { ok, ms: now() - t0, lvl: item.level, mode: run.mode });
        run.done(item, ok);
        streak = ok ? streak + 1 : 0;
      }
      if (a.kind === 'choice') {
        stage.querySelectorAll('[data-i]').forEach(b => {
          const i = Number(b.dataset.i);
          b.disabled = true;
          if (i === a.correct) b.classList.add('correct'); else if (i === input) b.classList.add('wrong');
        });
      }
      const inEl = stage.querySelector('#in');
      if (ok) {
        phase = 'feedback';
        if (inEl) { inEl.classList.add('flash-ok'); inEl.readOnly = true; }
        feedback('ok', `<h3>✅ ${pick(PRAISE)}${tries === 2 ? ' Deuxième essai réussi.' : ''}${streak >= 5 && tries === 1 ? ` 🔥 ${streak} d’affilée !` : ''}</h3>`);
        autoTimer = setTimeout(next, isChrono ? 250 : 900);
      } else if (!singleTry() && tries === 1) {
        feedback('ko', `<h3>❌ Pas tout à fait…</h3><b>Indice :</b> ${item.q.hint} <br><small>Tu as droit à un deuxième essai.</small>`);
        if (inEl) { inEl.value = ''; inEl.classList.add('flash-ko'); }
        const in2 = stage.querySelector('#in2'); if (in2) in2.value = '';
        focusInput();
      } else {
        phase = 'feedback';
        if (inEl) { inEl.classList.add('flash-ko'); inEl.readOnly = true; }
        if (isChrono) {
          feedback('ko', `<b>Réponse :</b> ${A.show(a)}`);
          autoTimer = setTimeout(next, 1200);
        } else {
          feedback('ko', `<h3>❌ La bonne réponse : ${A.show(a)}</h3><div class="corr">${item.q.correction}</div>
            <div class="row" style="margin-top:10px"><button class="btn primary" data-act="next">Continuer <kbd>Entrée</kbd></button><button class="btn" data-act="fb-lesson">📖 Revoir la leçon</button></div>`);
          stage.querySelector('[data-act=next]').addEventListener('click', next);
          stage.querySelector('[data-act=fb-lesson]').addEventListener('click', openLesson);
          stage.querySelector('[data-act=next]').focus();
        }
      }
      header();
    }

    function end() {
      clearTimeout(autoTimer); clearInterval(chronoTimer);
      run.finish();
      phase = 'end';
      root.querySelector('#foot').hidden = true;
      root.querySelector('#prog').innerHTML = '';
      root.querySelector('#meta').textContent = '';
      root.querySelector('[data-act=stop]').hidden = true;
      const s = run.summary();
      const record = isChrono && M.store.setChronoBest(run.opts.chronoKey, run.correct);
      const state = M.store.read();
      const best = isChrono ? state.chronoBest[run.opts.chronoKey] || 0 : 0;
      const pct = s.answered ? Math.round((100 * s.correct) / s.answered) : 0;
      const nList = arr => `<ul>${arr.map(n => `<li>${UI.STATUS[n.after].icon} <a href="#/lecon/${n.id}">${n.no.title}</a> — ${UI.STATUS[n.after].label}</li>`).join('')}</ul>`;
      const diagAll = run.mode === 'diag' ? [...run.touched].map(id => ({ id, no: byId[id], after: P.statusOf(state, byId[id]) })) : [];
      stage.innerHTML = `<div class="card summary">
        <h1>${isChrono ? '⏱ Temps écoulé !' : run.mode === 'diag' ? '🧭 Bilan terminé' : '🏁 Session terminée'}</h1>
        ${s.answered ? `<div class="score">${s.correct} / ${s.answered}</div><p class="center muted">${isChrono ? `bonnes réponses en 60 secondes · record : ${best}${record ? ' — 🎉 nouveau record !' : ''}` : `bonnes réponses du premier coup (${pct} %)`}</p>` : '<p class="center muted">Aucune réponse cette fois.</p>'}
        ${s.newBadges.length ? `<h2>🏅 Nouveau badge !</h2><div class="badges">${s.newBadges.map(b => `<div class="badge"><span class="ic">${b.icon}</span><div><b>${b.title}</b><small>${b.desc}</small></div></div>`).join('')}</div>` : ''}
        ${run.mode === 'diag' ? `<h2>Résultats</h2>${nList(diagAll)}` : ''}
        ${run.mode !== 'diag' && s.improved.length ? `<h2>📈 En progrès</h2>${nList(s.improved)}` : ''}
        ${run.mode !== 'diag' && s.toReview.length ? `<h2>📖 À revoir (clique pour lire la leçon)</h2>${nList(s.toReview)}` : ''}
        <div class="row" style="margin-top:20px">
          <a class="btn primary" href="#/">🏠 Accueil</a>
          <button class="btn" data-act="again">🔁 Recommencer</button>
          <a class="btn" href="#/sommaire">📚 Sommaire</a>
        </div>
      </div>`;
      stage.querySelector('[data-act=again]').addEventListener('click', restart);
      stage.querySelector('.btn.primary').focus();
    }

    UI.onKey(e => {
      if (phase === 'end' || !item) return false;
      if ((e.key === 'l' || e.key === 'L') && !e.ctrlKey && !e.metaKey) { e.preventDefault(); openLesson(); return true; }
      if (e.key === 'Enter') {
        if (phase === 'feedback') { e.preventDefault(); next(); return true; }
        if (phase === 'answer' && !['choice', 'order'].includes(item.q.answer.kind)) { e.preventDefault(); submit(readInput()); return true; }
        return false;
      }
      if (phase === 'answer' && /^[1-9]$/.test(e.key) && ['choice', 'order'].includes(item.q.answer.kind)) {
        const i = Number(e.key) - 1, a = item.q.answer;
        if (a.kind === 'choice' && i < a.options.length) submit(i);
        if (a.kind === 'order' && i < a.items.length) addOrder(i);
        e.preventDefault(); return true;
      }
      if (phase === 'answer' && e.key === 'Backspace' && item.q.answer.kind === 'order') { e.preventDefault(); undoOrder(); return true; }
      return false;
    });

    // Never-read lesson on a weak notion: suggest reading it first (free practice only).
    if (run.mode === 'free') {
      const id = run.opts.refill().id, state = M.store.read();
      if (P.statusOf(state, byId[id]) === 'weak' && !state.seen[id]) {
        stage.innerHTML = `<div class="card suggest"><h2 style="margin-top:0">📖 Et si tu lisais la leçon d’abord ?</h2>
          <p>Cette notion est à revoir et tu n’as pas encore ouvert sa leçon. Quelques minutes de lecture rendent l’entraînement bien plus efficace.</p>
          <div class="row"><a class="btn primary" href="#/lecon/${id}">Lire la leçon</a><button class="btn" data-act="go">Commencer quand même</button></div></div>`;
        stage.querySelector('[data-act=go]').addEventListener('click', () => next());
        stage.querySelector('[data-act=go]').focus();
        return;
      }
    }
    if (isChrono) startChrono();
    next();
  }

  // "Recommencer" re-runs the route, so the previous run is torn down properly.
  const start = make => runView(make(), { restart: () => UI.navigate() });
  UI.route('exercice/:id', ({ id }) => (content[id] ? start(() => M.engine.free(id)) : (location.hash = '#/sommaire')));
  UI.route('session', () => start(() => M.engine.daily()));
  UI.route('diagnostic/:dom', ({ dom }) => (domains[dom] ? start(() => M.engine.diagnostic(dom)) : (location.hash = '#/')));
  UI.route('chrono', () => start(() => M.engine.chrono()));
  UI.route('chrono/:id', ({ id }) => (byId[id] && byId[id].chrono ? start(() => M.engine.chrono(id)) : (location.hash = '#/')));
})();
