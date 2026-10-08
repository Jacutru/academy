// Pure functions: raw progress facts → level, status, stars, due date, streak, badges.
// Nothing derived here is ever stored.
(function () {
  'use strict';
  const M = globalThis.M;
  const { today, addDays, diffDays } = M.u;

  const INTERVALS = [1, 3, 7, 21, 60];   // spaced-review boxes, in days
  const WINDOW = 10;                      // answers used for the status
  const HIST_CAP = 30;
  const CHRONO_MS = 4000;                 // median time required for "excellent" on chrono notions

  const emptyNotion = () => ({ level: 1, hist: [], box: 0 });
  const median = arr => {
    if (!arr.length) return Infinity;
    const s = arr.slice().sort((a, b) => a - b), m = s.length >> 1;
    return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
  };
  const dayOf = at => today(new Date(at));

  // Rating spans on the success rate of the last WINDOW answers.
  const SPANS = { excellent: 0.98, good: 0.9, average: 0.8 };
  const EXCELLENT_MIN_ANSWERS = 5;
  const RANK = { new: 0, weak: 1, average: 2, good: 3, excellent: 4 };
  const atLeast = (s, min) => RANK[s] >= RANK[min];

  // Success rate (0–1) of the last WINDOW answers, or null with no answer.
  function successRate(np) {
    if (!np || !np.hist.length) return null;
    const w = np.hist.slice(-WINDOW);
    return w.filter(h => h.ok).length / w.length;
  }

  // 'new' | 'weak' (< 80 %) | 'average' (80 %+) | 'good' (90 %+) | 'excellent' (98 %+)
  function status(np, meta) {
    const rate = successRate(np);
    if (rate === null) return 'new';
    const w = np.hist.slice(-WINDOW);
    // Fewer than 3 answers (typically the diagnostic): 2 right → good, one right → average.
    if (w.length < 3) return rate === 1 && w.length === 2 ? 'good' : rate > 0 ? 'average' : 'weak';
    if (rate >= SPANS.excellent) {
      // Excellent also needs enough answers, the hardest level and, for mental maths, speed.
      const fast = !(meta && meta.chrono) || median(w.filter(h => h.ok && h.ms > 0).map(h => h.ms)) <= CHRONO_MS;
      return w.length >= EXCELLENT_MIN_ANSWERS && w[w.length - 1].lvl === 3 && fast ? 'excellent' : 'good';
    }
    return rate >= SPANS.good ? 'good' : rate >= SPANS.average ? 'average' : 'weak';
  }

  // ★ average, ★★ good, ★★★ excellent.
  const stars = (np, meta) => Math.max(0, RANK[status(np, meta)] - 1);

  function due(np) {
    if (!np || !np.hist.length) return null;
    return addDays(dayOf(np.hist[np.hist.length - 1].at), INTERVALS[np.box]);
  }
  // Spaced review applies once a notion is known (good or excellent).
  const isDue = (np, meta, td = today()) => atLeast(status(np, meta), 'good') && due(np) <= td;

  // Returns a new notion record after one (first-try) answer.
  function applyAnswer(np0, { ok, ms, at, lvl }, { meta, diag = false } = {}) {
    const np = np0 ? { level: np0.level, box: np0.box, hist: np0.hist.slice() } : emptyNotion();
    const wasDueReview = isDue(np, meta, dayOf(at));
    np.hist.push({ ok, ms, at, lvl });
    if (np.hist.length > HIST_CAP) np.hist.splice(0, np.hist.length - HIST_CAP);
    if (wasDueReview) np.box = ok ? Math.min(INTERVALS.length - 1, np.box + 1) : 0;
    if (!atLeast(status(np, meta), 'good')) np.box = 0;
    if (!diag) {
      const atLevel = [];
      for (let i = np.hist.length - 1; i >= 0 && np.hist[i].lvl === np.level; i--) atLevel.push(np.hist[i]);
      if (atLevel.length >= 3 && atLevel.slice(0, 3).every(h => h.ok) && np.level < 3) np.level++;
      else if (atLevel.length >= 2 && atLevel.slice(0, 2).every(h => !h.ok) && np.level > 1) np.level--;
    }
    return np;
  }

  // Level after a diagnostic pair: first question at level 2, follow-up at 3 (if right) or 1 (if wrong).
  const diagLevel = (firstOk, secondOk) => (firstOk ? (secondOk ? 3 : 2) : 1);

  function streak(days, td = today()) {
    const set = new Set(days);
    let d = set.has(td) ? td : addDays(td, -1), n = 0;
    while (set.has(d)) { n++; d = addDays(d, -1); }
    return n;
  }
  function longestStreak(days) {
    const s = [...new Set(days)].sort();
    let best = 0, cur = 0;
    s.forEach((d, i) => { cur = i && diffDays(s[i - 1], d) === 1 ? cur + 1 : 1; best = Math.max(best, cur); });
    return best;
  }

  // ---------- Aggregates over the catalogue ----------
  const withContent = notions => notions.filter(n => M.cat.content[n.id]);
  // Notions to master for the pupil's target (class + programme version), among those given.
  const inScope = (state, notions) => withContent(notions).filter(no => M.programmes.inScope(state.target || M.programmes.DEFAULT, no.id));
  const statusOf = (state, no) => status(state.notions[no.id], no);
  const diagDone = (state, domain) => inScope(state, domain.notions).every(no => state.notions[no.id] && state.notions[no.id].hist.length);
  function domainProgress(state, domain) {
    const ns = inScope(state, domain.notions), total = ns.length * 3;
    const got = ns.reduce((s, no) => s + stars(state.notions[no.id], no), 0);
    return { stars: got, total, pct: total ? Math.round((100 * got) / total) : 0 };
  }

  // Badges reward real mastery: excellent (98 %+, level 3, enough answers).
  const allMastered = (state, ids) => ids.every(id => statusOf(state, M.cat.byId[id]) === 'excellent');
  const chapterIds = chId => M.cat.list.filter(n => n.chapter.id === chId).map(n => n.id);
  const BADGES = [
    { id: 'tables', icon: '✖️', title: 'Toutes les tables', desc: 'Maîtriser les tables de multiplication et de division.', test: s => allMastered(s, ['tables-mult', 'tables-div']) },
    { id: 'decimaux', icon: '🔟', title: 'As des décimaux', desc: 'Maîtriser tout le chapitre « Nombres décimaux ».', test: s => allMastered(s, chapterIds('decimaux')) },
    { id: 'fractions', icon: '🍕', title: 'Maître des fractions', desc: 'Maîtriser tout le chapitre « Fractions ».', test: s => allMastered(s, chapterIds('fractions')) },
    { id: 'diag', icon: '🧭', title: 'Bilan complet', desc: 'Terminer les trois parties du bilan de départ.', test: s => M.cat.tree.every(d => diagDone(s, d)) },
    { id: 'streak7', icon: '🔥', title: '7 jours d’affilée', desc: 'S’entraîner 7 jours de suite.', test: s => longestStreak(s.days) >= 7 },
    { id: 'chrono30', icon: '⚡', title: 'Éclair', desc: '30 bonnes réponses en 60 secondes.', test: s => Object.values(s.chronoBest).some(v => v >= 30) },
    { id: 'answers500', icon: '💯', title: '500 réponses', desc: 'Répondre à 500 questions.', test: s => s.log.length >= 500 },
  ];
  const badges = state => BADGES.map(b => ({ ...b, earned: !!b.test(state) }));

  // Most chosen explanation style overall (null if none yet).
  function favoriteStyle(state) {
    const n = {};
    Object.values(state.explain || {}).forEach(st => { n[st] = (n[st] || 0) + 1; });
    const best = Object.entries(n).sort((a, b) => b[1] - a[1])[0];
    return best ? best[0] : null;
  }
  // Index of the explanation to show first for a notion.
  function preferredExplanation(state, id, variants) {
    const want = (state.explain || {})[id] || favoriteStyle(state);
    return Math.max(0, variants.findIndex(v => v.style === want));
  }

  M.progress = {
    SPANS, RANK, atLeast, successRate,
    INTERVALS, WINDOW, HIST_CAP, CHRONO_MS,
    emptyNotion, median, dayOf, status, stars, due, isDue, applyAnswer, diagLevel,
    favoriteStyle, preferredExplanation, streak, longestStreak, withContent, inScope, statusOf, diagDone, domainProgress, badges,
  };
})();
