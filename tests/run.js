#!/usr/bin/env node
// Runs every check against the same scripts index.html loads (minus the UI): node tests/run.js [samples]
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
const scripts = [...html.matchAll(/<script src="([^"]+)"><\/script>/g)].map(m => m[1]).filter(s => !s.startsWith('js/ui/'));
const ctx = vm.createContext({ console });
scripts.forEach(src => vm.runInContext(fs.readFileSync(path.join(ROOT, src), 'utf8'), ctx, { filename: src }));
const M = ctx.M;

const SAMPLES = Number(process.argv[2]) || 2000;
let failures = 0, passes = 0;
const fail = (msg) => { failures++; if (failures <= 60) console.log('  ✗ ' + msg); };
const ok = (cond, msg) => (cond ? passes++ : fail(msg));
const eq = (a, b, msg) => ok(JSON.stringify(a) === JSON.stringify(b), `${msg}: expected ${JSON.stringify(b)}, got ${JSON.stringify(a)}`);
const section = t => console.log('\n▶ ' + t);

// ------------------------------------------------------------------ util
section('util');
const U = M.u;
eq(U.add(0.1, 0.2), 0.3, 'add exact');
eq(U.mul(1.1, 1.1), 1.21, 'mul exact');
eq(U.sub(10, 7.85), 2.15, 'sub exact');
eq(U.div(7, 4), 1.75, 'div exact');
eq(U.div(10, 3), null, 'div non-terminating');
eq(U.round(2.675, 2), 2.68, 'round half up');
eq(U.round(2.996, 2), 3, 'round carry');
eq(U.round(-1.25, 1), -1.3, 'round negative');
eq(U.trunc(12.349, 1), 12.3, 'trunc');
eq(U.decimals(0.001), 3, 'decimals');
eq(U.decimals(1e-7), 7, 'decimals exp');
eq(U.fmt(1234.5).replace(/\s/g, ' '), '1 234,5', 'fmt fr');
eq(U.fmtK(4.5, 2), '4,50', 'fmtK');
eq(U.addDays('2026-03-28', 1), '2026-03-29', 'addDays across DST');
eq(U.addDays('2026-12-31', 1), '2027-01-01', 'addDays year');
eq(U.diffDays('2026-02-27', '2026-03-02'), 3, 'diffDays');
const r1 = U.rng(42), r2 = U.rng(42);
eq([r1.next(), r1.int(1, 6)], [r2.next(), r2.int(1, 6)], 'seeded rng reproducible');

// ------------------------------------------------------------------ answer parsing
section('answer parsing');
const A = M.answer;
const chk = (ans, input) => A.check(ans, input).status;
[['3,5', 3.5], ['3.50', 3.5], ['1 000', 1000], ['1 000', 1000], ['−2', -2], ['+4', 4], [',5', 0.5], ['3,', 3]].forEach(([s, v]) => eq(A.parseNumber(s), v, `parseNumber(${s})`));
['', 'abc', '3,5,2', '1/2', '3 .5x'].forEach(s => eq(A.parseNumber(s), null, `parseNumber(${s}) invalid`));
eq(chk({ kind: 'number', value: 3.5 }, '3,50'), 'ok', '3,50 = 3,5');
eq(chk({ kind: 'number', value: 3.5 }, '35'), 'wrong', '35 ≠ 3,5');
eq(chk({ kind: 'number', value: 3.5 }, 'bof'), 'invalid', 'garbage is invalid, not wrong');
eq(chk({ kind: 'fraction', n: 3, d: 4 }, '6/8'), 'ok', '6/8 accepted when not simplified');
eq(chk({ kind: 'fraction', n: 3, d: 4, simplified: true }, '6/8'), 'invalid', '6/8 refused (not wrong) when simplified required');
eq(chk({ kind: 'fraction', n: 3, d: 4, simplified: true }, '3/4'), 'ok', '3/4 simplified');
eq(chk({ kind: 'fraction', n: 3, d: 4 }, '4/3'), 'wrong', '4/3 wrong');
eq(chk({ kind: 'fraction', n: 4, d: 1 }, '4'), 'ok', 'integer as fraction');
eq(chk({ kind: 'fraction', n: 3, d: 4 }, '3/0'), 'invalid', 'zero denominator invalid');
[['1h05', 3900], ['1 h 5 min', 3900], ['65 min', 3900], ['1 h 05', 3900], ['2min30', 150], ['2 min 30 s', 150], ['1h 2min 3s', 3723], ['1 heure 5 minutes', 3900], ['45mn', 2700]]
  .forEach(([s, v]) => eq(A.parseDuration(s), v, `parseDuration(${s})`));
['65', 'h05', 'abc', ''].forEach(s => eq(A.parseDuration(s), null, `parseDuration(${s}) invalid`));
eq(chk({ kind: 'division', q: 7, r: 3 }, { q: '7', r: '3' }), 'ok', 'division object');
eq(chk({ kind: 'division', q: 7, r: 3 }, 'q=7 r=3'), 'ok', 'division string');
eq(chk({ kind: 'division', q: 7, r: 3 }, { q: '7', r: '' }), 'invalid', 'division missing remainder');
eq(chk({ kind: 'choice', options: ['a', 'b'], correct: 1 }, 1), 'ok', 'choice ok');
eq(chk({ kind: 'choice', options: ['a', 'b'], correct: 1 }, 0), 'wrong', 'choice wrong');
eq(chk({ kind: 'order', items: ['a', 'b', 'c'], correct: [2, 0, 1] }, [2, 0, 1]), 'ok', 'order ok');
eq(chk({ kind: 'order', items: ['a', 'b', 'c'], correct: [2, 0, 1] }, [2, 0]), 'invalid', 'order incomplete');
eq(A.formatDuration(3900), '1 h 05 min', 'formatDuration h min');
eq(A.formatDuration(150), '2 min 30 s', 'formatDuration min s');
eq(A.formatDuration(3723), '1 h 02 min 3 s', 'formatDuration h min s');

// ------------------------------------------------------------------ catalogue integrity
section('catalogue');
const { list, byId, content } = M.cat;
list.forEach(no => {
  const c = content[no.id];
  ok(c, `notion ${no.id} has no content`);
  if (!c) return;
  ok(typeof c.generate === 'function', `${no.id}: generate missing`);
  const L = c.lesson || {};
  ok(typeof L.retenir === 'string' && L.retenir.length > 20, `${no.id}: lesson.retenir missing`);
  ok(Array.isArray(L.methode) && L.methode.length > 0, `${no.id}: lesson.methode missing`);
  ok(Array.isArray(L.exemples) && L.exemples.length > 0 && L.exemples.every(e => e.q && e.r), `${no.id}: lesson.exemples missing/invalid`);
  ['astuces', 'erreurs'].forEach(k => ok(L[k] === undefined || Array.isArray(L[k]), `${no.id}: lesson.${k} must be an array`));
  no.prereq.forEach(p => ok(byId[p], `${no.id}: unknown prereq ${p}`));
  const html = JSON.stringify(L);
  ok(!/undefined|NaN|\[object/.test(html), `${no.id}: lesson contains undefined/NaN`);
});
Object.keys(content).forEach(id => ok(byId[id], `orphan notion module ${id} (not in sommaire)`));
// Every notion offers at least two ways of explaining, in distinct known styles; the lesson's own
// explanation is always one of them (never dead content).
list.forEach(no => {
  const raw = M.cat.explanations[no.id] || [];
  const styles = raw.map(v => v.style);
  ok(raw.length >= 2, `${no.id}: needs at least 2 explanations (has ${raw.length})`);
  ok(new Set(styles).size === styles.length, `${no.id}: duplicate explanation style`);
  ok(styles.every(st => M.cat.STYLES[st]), `${no.id}: unknown explanation style in ${styles}`);
  const usesBase = raw.some(v => v.html === M.cat.BASE);
  const hasBase = !!(content[no.id] && content[no.id].lesson.explication);
  ok(usesBase === hasBase, `${no.id}: lesson.explication ${hasBase ? 'not offered' : 'missing but referenced'}`);
  M.cat.explanationsOf(no.id).forEach(v => ok(typeof v.html === 'string' && v.html.length > 30 && !/undefined|NaN/.test(v.html), `${no.id}: empty/bad explanation (${v.style})`));
});
Object.keys(M.cat.explanations).forEach(id => ok(byId[id], `explanations for unknown notion ${id}`));
// Cycle detection.
const stateOf = {};
const dfs = (id, trail) => {
  if (stateOf[id] === 2) return;
  if (stateOf[id] === 1) { fail('prereq cycle: ' + [...trail, id].join(' → ')); return; }
  stateOf[id] = 1; byId[id].prereq.forEach(p => byId[p] && dfs(p, [...trail, id])); stateOf[id] = 2;
};
list.forEach(no => dfs(no.id, []));
console.log(`  ${list.length} notions in ${M.cat.tree.length} domains`);

// ------------------------------------------------------------------ generators
section(`generators (${SAMPLES} samples × level)`);
const BAD = /undefined|NaN|Infinity|\[object|\bnull\b/;
const variety = [], leaks = {};
list.forEach(no => {
  const c = content[no.id];
  if (!c) return;
  for (let level = 1; level <= 3; level++) {
    if (process.env.TRACE) console.log('  …', no.id, level);
    const keys = new Set();
    let errs = 0;
    for (let s = 1; s <= SAMPLES && errs < 3; s++) {
      let q;
      try { q = c.generate(level, U.rng(s * 7919 + level)); } catch (e) { fail(`${no.id} L${level} seed ${s}: threw ${e.message}`); errs++; continue; }
      const where = `${no.id} L${level} seed ${s}`;
      const bad = (cond, msg) => { if (!cond) { fail(`${where}: ${msg}`); errs++; } };
      bad(q && typeof q.key === 'string' && q.key.length, 'missing key');
      bad(typeof q.prompt === 'string' && q.prompt.length, 'missing prompt');
      bad(typeof q.hint === 'string' && q.hint.length, 'missing hint');
      bad(typeof q.correction === 'string' && q.correction.length, 'missing correction');
      const a = q.answer;
      const v = A.validate(a);
      bad(!v.length, `invalid answer ${JSON.stringify(a)}: ${v.join(', ')}`);
      if (v.length) continue;
      bad(A.check(a, A.perfectInput(a)).status === 'ok', `perfect input rejected: ${JSON.stringify(a)}`);
      const shown = A.show(a);
      [q.prompt, q.hint, q.correction, shown, ...(a.options || []), ...(a.items || [])].forEach(t => bad(!BAD.test(String(t)), `bad text: ${String(t).slice(0, 120)}`));
      if (a.kind === 'number') {
        bad(U.isNice(a.value, 6), `not nice: ${a.value}`);
        bad(a.value >= 0 || no.negatives, `negative: ${a.value}`);
        bad(A.check(a, U.fmt(U.add(a.value, 1))).status === 'wrong', 'value+1 accepted');
        bad(q.correction.includes(U.fmt(a.value)), `correction does not show the answer ${U.fmt(a.value)}: ${q.correction.slice(0, 160)}`);
      }
      if (a.kind === 'number' && a.value >= 10) {
        const v = U.fmt(a.value).replace(/\u202f/g, ' ');
        if (new RegExp(`(^|[^\\d,])${v.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}($|[^\\d,])`).test(q.hint.replace(/\u202f/g, ' '))) leaks[no.id] = (leaks[no.id] || 0) + 1;
      }
      if (a.kind === 'fraction') bad(a.n >= 0 || no.negatives, `negative fraction ${a.n}/${a.d}`);
      if (a.kind === 'division') bad(a.r >= 0, 'negative remainder');
      keys.add(q.key);
    }
    variety.push([`${no.id} L${level}`, keys.size]);
  }
});
if (Object.keys(leaks).length) console.log('  hints containing the answer (info): ' + Object.entries(leaks).map(([k, n]) => `${k}=${n}`).join(', '));
const low = variety.filter(([, n]) => n < 8);
if (low.length) console.log('  low variety (info): ' + low.map(([k, n]) => `${k}=${n}`).join(', '));

// ------------------------------------------------------------------ progress rules
section('progress');
const P = M.progress;
const T0 = new Date(2026, 9, 8, 10, 0).getTime();
const H = (oks, lvl = 3, ms = 2000) => oks.map((o, i) => ({ ok: !!o, ms, at: T0 + i * 1000, lvl }));
eq(P.status(undefined), 'new', 'status new');
eq(P.status({ level: 3, box: 0, hist: H([1, 1, 1, 1, 1, 1, 1, 1, 1, 1]) }), 'mastered', 'status mastered');
eq(P.status({ level: 3, box: 0, hist: H([0, 1, 1, 1, 1, 1, 1, 1, 1, 1]) }), 'mastered', '9/10 still mastered');
eq(P.status({ level: 3, box: 0, hist: H([0, 0, 1, 1, 1, 1, 1, 1, 1, 1]) }), 'fragile', '8/10 fragile');
eq(P.status({ level: 2, box: 0, hist: H([1, 1, 1, 1, 1], 2) }), 'fragile', '100 % at level 2 is not mastered');
eq(P.status({ level: 1, box: 0, hist: H([0, 0, 1, 0, 1], 1) }), 'weak', '40 % weak');
eq(P.status({ level: 2, box: 0, hist: H([1, 0], 2) }), 'fragile', 'diagnostic 1 of 2 → fragile');
eq(P.status({ level: 1, box: 0, hist: H([0, 0], 1) }), 'weak', 'diagnostic 0 of 2 → weak');
eq(P.status({ level: 3, box: 0, hist: H([1, 1, 1, 1, 1], 3, 6000) }, { chrono: true }), 'fragile', 'chrono notion too slow → fragile');
eq(P.status({ level: 3, box: 0, hist: H([1, 1, 1, 1, 1], 3, 2500) }, { chrono: true }), 'mastered', 'chrono notion fast → mastered');
// Level changes.
let np;
np = undefined; [1, 1, 1].forEach((o, i) => { np = P.applyAnswer(np, { ok: !!o, ms: 1000, at: T0 + i, lvl: np ? np.level : 1 }); });
eq(np.level, 2, 'level up after 3 correct');
[1, 1, 1].forEach((o, i) => { np = P.applyAnswer(np, { ok: true, ms: 1000, at: T0 + 10 + i, lvl: np.level }); });
eq(np.level, 3, 'level 3 after 3 more');
[0, 0].forEach((o, i) => { np = P.applyAnswer(np, { ok: false, ms: 1000, at: T0 + 20 + i, lvl: np.level }); });
eq(np.level, 2, 'level down after 2 mistakes');
np = P.applyAnswer(undefined, { ok: true, ms: 1, at: T0, lvl: 2 }, { diag: true });
eq(np.level, 1, 'diag answers do not move the level');
eq([P.diagLevel(true, true), P.diagLevel(true, false), P.diagLevel(false, true), P.diagLevel(false, false)], [3, 2, 1, 1], 'diagLevel');
// Spaced review: mastered today → box 0; reviewed correctly the next day → box 1 → 3 stars.
np = { level: 3, box: 0, hist: H([1, 1, 1, 1, 1, 1, 1, 1, 1, 1]) };
eq(P.stars(np), 2, 'mastered, not reviewed yet → 2 stars');
eq(P.due(np), '2026-10-09', 'due next day');
eq(P.isDue(np, undefined, '2026-10-08'), false, 'not due same day');
np = P.applyAnswer(np, { ok: true, ms: 1000, at: new Date(2026, 9, 9, 9).getTime(), lvl: 3 });
eq(np.box, 1, 'box 1 after successful review');
eq(P.stars(np), 3, '3 stars after review');
eq(P.due(np), '2026-10-12', 'next review in 3 days');
np = P.applyAnswer(np, { ok: false, ms: 1000, at: new Date(2026, 9, 12, 9).getTime(), lvl: 3 });
eq(np.box, 0, 'missed review → box 0');
// Streaks use local days, including a session just before midnight.
const late = new Date(2026, 9, 7, 23, 58).getTime(), early = new Date(2026, 9, 8, 0, 5).getTime();
eq(P.dayOf(late), '2026-10-07', 'late evening counts for that day');
eq(P.streak([P.dayOf(late), P.dayOf(early)], '2026-10-08'), 2, 'streak over midnight');
eq(P.streak(['2026-10-05', '2026-10-06', '2026-10-07'], '2026-10-08'), 3, 'streak alive if played yesterday');
eq(P.streak(['2026-10-05', '2026-10-06'], '2026-10-08'), 0, 'streak broken');
eq(P.longestStreak(['2026-10-01', '2026-10-02', '2026-10-04', '2026-10-05', '2026-10-06']), 3, 'longest streak');

// ------------------------------------------------------------------ store (in-memory mode under node)
section('store');
const St = M.store;
St.reset();
St.recordAnswer('tables-mult', { ok: true, ms: 1500, lvl: 1, mode: 'free', at: T0 });
St.recordAnswer('tables-mult', { ok: false, ms: 3000, lvl: 1, mode: 'free', at: T0 + 1000 });
let s = St.read();
eq(s.notions['tables-mult'].hist.length, 2, 'answers recorded');
eq(s.log.length, 2, 'log appended');
eq(s.days, ['2026-10-08'], 'active day recorded');
eq(St.setChronoBest('mix', 12), true, 'chrono record');
eq(St.setChronoBest('mix', 10), false, 'not a record');
const dump = St.exportJSON();
St.reset();
eq(St.read().log.length, 0, 'reset');
St.importJSON(dump);
eq(St.read().log.length, 2, 'import restores');
let threw = false; try { St.importJSON('{"foo":1}'); } catch (e) { threw = true; } eq(threw, true, 'import rejects foreign JSON');
const csv = St.exportCSV();
ok(csv.startsWith('\ufeffeleve;date;heure;notion'), 'CSV header');
eq(csv.trim().split('\r\n').length, 3, 'CSV rows');
const mig = St.migrate({ notions: { x: { level: 9, box: 7, hist: [{ ok: true, at: 1, ms: 1, lvl: 1 }, { bad: 1 }] } }, days: ['bad', '2026-01-01'] });
eq([mig.v, mig.notions.x.level, mig.notions.x.box, mig.notions.x.hist.length, mig.days], [1, 3, 4, 1, ['2026-01-01']], 'migrate sanitises');
eq(St.migrate(null).v, 1, 'migrate(null)');
eq(St.migrate({ notions: {}, target: { version: '1999', classe: 'CP' } }).target, M.programmes.DEFAULT, 'unknown target falls back to default');
eq(M.programmes.relation({ version: '2025', classe: '6e' }, 'priorites'), 'apres', 'priorités are after 6e in 2025');
eq(M.programmes.relation({ version: '2025', classe: '5e' }, 'priorites'), 'cible', 'priorités are 5e in 2025');
eq(M.programmes.relation({ version: '2025', classe: '5e' }, 'tables-mult'), 'avant', 'tables come before 5e');
eq(M.programmes.relation({ version: '2025', classe: '6e' }, 'pgcd'), 'hors', 'PGCD outside the 2025 programmes');
// Every programme version maps every notion to a known class.
M.programmes.versions.forEach(v => list.forEach(no => ok(M.programmes.CLASSES.includes(v.levels[no.id]) || v.levels[no.id] === 'hors', `${v.id}: bad level for ${no.id}: ${v.levels[no.id]}`)));
eq(M.programmes.relation({ version: '2008', classe: '6e' }, 'pgcd'), 'apres', 'PGCD was taught later (3e) in 2008');
eq(M.programmes.relation({ version: '2018', classe: '6e' }, 'priorites'), 'cible', 'priorités were 6e in 2018');
eq(St.migrate({ notions: {} }).name, '', 'old saves get an empty name');
St.setName('  Léa   Marie  ');
eq(St.read().name, 'Léa Marie', 'name trimmed');
eq(St.fileStem(), 'academy-lea-marie', 'export file stem');
St.setExplainPref('aires', 'vie'); St.setExplainPref('perimetres', 'vie'); St.setExplainPref('tables-mult', 'dessin');
eq(P.favoriteStyle(St.read()), 'vie', 'favourite explanation style');
eq(P.preferredExplanation(St.read(), 'tables-mult', M.cat.explanationsOf('tables-mult')), 0, 'notion choice wins');
eq(M.cat.explanationsOf('volume-pave')[P.preferredExplanation(St.read(), 'volume-pave', M.cat.explanationsOf('volume-pave'))].style, 'vie', 'favourite style used for other notions');
eq(St.migrate({ notions: {}, explain: { a: 'vie', b: 'nope', c: 3 } }).explain, { a: 'vie' }, 'migrate keeps only known styles');
ok(St.exportCSV().split('\r\n')[0].startsWith('\ufeffeleve;date'), 'CSV has the pupil column');

// ------------------------------------------------------------------ engine
section('engine');
const E = M.engine;
St.reset();
let plan = E.planDaily(St.read());
eq(plan.length, E.DAILY_SIZE, 'daily plan size on blank state');
eq(E.nextStep().kind, 'diag', 'blank state → diagnostic first');
eq(E.nextStep().domain.id, 'nombres', 'first diagnostic part');
// Play a full diagnostic part perfectly.
const run = E.diagnostic('mesures');
let item, n = 0;
while ((item = run.next()) && n < 200) {
  ok(item.q && item.q.answer, 'diag question generated');
  St.recordAnswer(item.id, { ok: true, ms: 2000, lvl: item.level, mode: 'diag' });
  run.done(item, true); n++;
}
eq(n, P.inScope(St.read(), M.cat.domains.mesures.notions).length * 2, 'diag asks 2 questions per notion of the target');
eq(P.diagDone(St.read(), M.cat.domains.mesures), true, 'diag part done');
eq(St.read().notions['aires'].level, 3, 'diag sets level 3 after two right answers');
eq(P.statusOf(St.read(), byId['aires']), 'mastered', 'diag perfect → mastered');
// Weak notion appears in the daily plan, with its weak prerequisite first.
St.update(st => {
  st.notions['frac-somme'] = { level: 1, box: 0, hist: H([0, 0, 0], 1) };
  st.notions['frac-egales'] = { level: 1, box: 0, hist: H([0, 1, 0], 1) };
});
plan = E.planDaily(St.read());
ok(plan.some(p => p.id === 'frac-somme'), 'weak notion in plan');
ok(plan.findIndex(p => p.id === 'frac-egales') < plan.findIndex(p => p.id === 'frac-somme'), 'prerequisite before dependent');
// Diagnostic interrupted after a notion's first question: level set from that answer.
St.reset();
const dr = E.diagnostic('geometrie');
const d1 = dr.next(); St.recordAnswer(d1.id, { ok: true, ms: 1000, lvl: 2, mode: 'diag' }); dr.done(d1, true);
eq(dr.total(), P.inScope(St.read(), M.cat.domains.geometrie.notions).length * 2, 'diag total counts follow-ups upfront');
dr.finish();
eq(St.read().notions[d1.id].level, 2, 'interrupted diag: level 2 from a right first answer');
// Free run: retry inserted later, not immediately.
const fr = E.free('tables-mult');
const first = fr.next(); fr.done(first, false);
const nexts = [fr.next(), fr.next(), fr.next(), fr.next(), fr.next()];
ok(nexts.slice(0, 2).every(x => !x.retry), 'retry not immediate');
ok(nexts.some(x => x.retry && x.q.key === first.q.key), 'missed question comes back');

// ------------------------------------------------------------------
console.log(`\n${failures ? '❌' : '✅'} ${passes} passed, ${failures} failed`);
process.exit(failures ? 1 : 0);
