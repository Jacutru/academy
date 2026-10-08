// Question selection: free practice, daily session, diagnostic, chrono.
// A "run" exposes next() → item | null and done(item, firstOk); the UI drives it.
(function () {
  'use strict';
  const M = globalThis.M;
  const { rng: makeRng, newSeed, today } = M.u;
  const P = M.progress;
  const { byId, list, content, domains } = M.cat;

  const RECENT = 8;
  const DAILY_SIZE = 15;

  // Generate a question, avoiding recently seen keys.
  function question(id, level, recent = [], seed) {
    const def = content[id];
    for (let i = 0; i < 25; i++) {
      const s = seed !== undefined && i === 0 ? seed : newSeed();
      const q = def.generate(level, makeRng(s));
      if (!recent.includes(q.key) || i === 24) return { ...q, id, level, seed: s };
    }
  }

  const playable = () => list.filter(no => content[no.id]);
  const levelOf = (state, id) => (state.notions[id] ? state.notions[id].level : 1);

  // Base run: queue of { id, level?, q?, retry?, diag? } items.
  function makeRun(mode, title, queue, opts = {}) {
    const recent = [];
    const run = {
      mode, title, queue, opts,
      answered: 0, correct: 0, firstAnswered: 0, firstCorrect: 0, touched: new Set(),
      startStatuses: {}, startBadges: P.badges(M.store.read()).filter(b => b.earned).map(b => b.id),
      // A first diagnostic question always brings a follow-up: count it upfront.
      total: () => (opts.infinite ? null : run.answered + queue.length + queue.filter(it => it.diag === 1).length),
      next() {
        let item = queue.shift();
        if (!item && opts.infinite) item = opts.refill();
        if (!item) return null;
        const state = M.store.read();
        if (!(item.id in run.startStatuses)) run.startStatuses[item.id] = P.statusOf(state, byId[item.id]);
        const level = item.level || levelOf(state, item.id);
        const q = item.q || question(item.id, level, recent);
        recent.push(q.key); if (recent.length > RECENT) recent.shift();
        return { ...item, level, q };
      },
      done(item, ok) {
        run.answered++; if (ok) run.correct++;
        if (!item.retry) { run.firstAnswered++; if (ok) run.firstCorrect++; }   // a retry is not a first try
        run.touched.add(item.id);
        if (opts.onDone) opts.onDone(item, ok, run);
        // A missed question comes back 3–5 questions later (once).
        if (!ok && !item.retry && opts.retry !== false) {
          while (opts.infinite && queue.length < 5) queue.push(opts.refill());
          queue.splice(Math.min(queue.length, 2 + Math.floor(Math.random() * 3)), 0, { ...item, retry: true });
        }
      },
      // Called once when the run stops (finished or interrupted).
      finish() { if (opts.onFinish) opts.onFinish(run); },
      summary() {
        const state = M.store.read();
        const notions = [...run.touched].map(id => ({ id, no: byId[id], before: run.startStatuses[id], after: P.statusOf(state, byId[id]) }));
        const rank = P.RANK;
        const nowBadges = P.badges(state).filter(b => b.earned && !run.startBadges.includes(b.id));
        return {
          answered: run.firstAnswered, correct: run.firstCorrect,
          improved: notions.filter(n => rank[n.after] > rank[n.before] && n.after !== 'weak'),
          toReview: notions.filter(n => n.after === 'weak' || n.after === 'average'),
          newBadges: nowBadges,
        };
      },
    };
    return run;
  }

  // ---------- Free practice on one notion (endless) ----------
  const free = id => makeRun('free', byId[id].title, [], { infinite: true, refill: () => ({ id }) });

  // ---------- Daily session ----------
  // ~70 % weak/average notions (🔴 first, prerequisites first), ~30 % due reviews; new notions fill gaps.
  function planDaily(state, n = DAILY_SIZE, td = today()) {
    const ns = playable();
    const st = no => P.statusOf(state, no);
    const practised = ns.filter(no => st(no) !== 'new');
    const rank = { weak: 0, average: 1 };
    let weak = practised.filter(no => st(no) in rank).sort((a, b) => rank[st(a)] - rank[st(b)] || a.index - b.index);
    // Put weak prerequisites before the notions that depend on them.
    const ordered = [], seen = new Set(), weakIds = new Set(weak.map(w => w.id));
    const visit = no => { if (seen.has(no.id)) return; seen.add(no.id); no.prereq.filter(p => weakIds.has(p)).forEach(p => visit(byId[p])); ordered.push(no); };
    weak.forEach(visit);
    weak = ordered.slice(0, 5);
    const dueList = practised.filter(no => P.isDue(state.notions[no.id], no, td)).sort((a, b) => P.due(state.notions[a.id]).localeCompare(P.due(state.notions[b.id])));
    // New notions: those of the pupil's target first.
    const inTarget = new Set(P.inScope(state, ns).map(no => no.id));
    const fresh = ns.filter(no => st(no) === 'new').sort((a, b) => inTarget.has(b.id) - inTarget.has(a.id));

    const reviewSlots = Math.min(dueList.length, Math.round(n * 0.3));
    const main = weak.length ? weak : fresh.slice(0, 4);
    const items = [];
    for (let i = 0; items.length < n - reviewSlots && main.length && i < 100; i++) items.push({ id: main[i % main.length].id });
    const reviews = dueList.slice(0, reviewSlots).map(no => ({ id: no.id }));
    // Still short (nothing weak, nothing new)? Top up with random practised notions.
    const pool = practised.length ? practised : ns;
    while (items.length + reviews.length < n) items.push({ id: pool[Math.floor(Math.random() * pool.length)].id });
    // Interleave reviews among the main items.
    const out = [];
    const step = reviews.length ? Math.max(1, Math.floor(items.length / reviews.length)) : Infinity;
    items.forEach((it, i) => { out.push(it); if ((i + 1) % step === 0 && reviews.length) out.push(reviews.shift()); });
    return out.concat(reviews);
  }
  const daily = () => makeRun('session', 'Entraînement du jour', planDaily(M.store.read()));

  // ---------- Diagnostic (one domain) ----------
  function diagnostic(domainId) {
    const dom = domains[domainId], state = M.store.read();
    let ns = P.inScope(state, dom.notions);
    const todo = ns.filter(no => !(state.notions[no.id] && state.notions[no.id].hist.length));
    if (todo.length) ns = todo;
    const queue = ns.map(no => ({ id: no.id, level: 2, diag: 1 }));
    return makeRun('diag', `Bilan — ${dom.title}`, queue, {
      retry: false,
      onDone(item, ok, run) {
        if (item.diag === 1) run.queue.unshift({ id: item.id, level: ok ? 3 : 1, diag: 2, firstOk: ok });
        else M.store.setLevel(item.id, P.diagLevel(item.firstOk, ok));
      },
      // Stopped between a notion's two questions: set its level from the first answer alone.
      onFinish(run) { run.queue.filter(it => it.diag === 2).forEach(it => M.store.setLevel(it.id, it.firstOk ? 2 : 1)); },
    });
  }

  // ---------- Chrono (60 s) ----------
  const CHRONO_MS = 60000;
  const chronoNotions = () => playable().filter(no => no.chrono);
  function chrono(id) {
    const ids = id ? [id] : chronoNotions().map(n => n.id);
    return makeRun('chrono', id ? `Chrono — ${byId[id].title}` : 'Chrono — calcul mental', [], {
      infinite: true, retry: false, timeLimit: CHRONO_MS, chronoKey: id || 'mix',
      refill: () => ({ id: ids[Math.floor(Math.random() * ids.length)] }),
    });
  }

  // ---------- Home: what should the kid do next? ----------
  function nextStep(state = M.store.read(), td = today()) {
    const dom = M.cat.tree.find(d => !P.diagDone(state, d));
    if (dom) return { kind: 'diag', domain: dom };
    const doneToday = state.log.some(e => e[5] === 'session' && P.dayOf(e[0]) === td);
    const ns = playable();
    const pending = ns.some(no => ['weak', 'average'].includes(P.statusOf(state, no)) || P.isDue(state.notions[no.id], no, td));
    if (pending && !doneToday) return { kind: 'daily' };
    return { kind: doneToday ? 'doneToday' : 'upToDate' };
  }

  M.engine = { question, free, daily, planDaily, diagnostic, chrono, chronoNotions, nextStep, CHRONO_MS, DAILY_SIZE };
})();
