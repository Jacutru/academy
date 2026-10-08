// Typed answers: one parser + checker per kind. Questions only return data; all checking lives here.
//   { kind:'number',   value, unit? }
//   { kind:'fraction', n, d, simplified? }        simplified: the answer must be irreducible
//   { kind:'choice',   options:[html], correct }  correct: index
//   { kind:'division', q, r }                     Euclidean division
//   { kind:'duration', s, units }                 s: total seconds, units: 'hm' | 'ms' | 'hms'
//   { kind:'order',    items:[html], correct:[indices in the right order], sep }
// check() returns { status: 'ok' | 'wrong' | 'invalid', msg? }. 'invalid' never counts as a mistake.
(function () {
  'use strict';
  const M = globalThis.M;
  const { gcd, fmt, eq } = M.u;
  const { frac } = M.h;

  const strip = s => String(s ?? '').replace(/[\s  ]/g, '');

  function parseNumber(s) {
    const t = strip(s).replace(',', '.').replace(/^\+/, '').replace(/^[−–]/, '-');
    if (!/^-?(\d+(\.\d*)?|\.\d+)$/.test(t)) return null;
    return parseFloat(t);
  }

  function parseFraction(s) {
    const t = strip(s).replace(/[−–]/, '-');
    let m = /^(-?\d+)\/(\d+)$/.exec(t);
    if (m) return Number(m[2]) === 0 ? null : { n: Number(m[1]), d: Number(m[2]) };
    m = /^-?\d+$/.exec(t);
    return m ? { n: Number(t), d: 1 } : null;
  }

  // "1h05", "1 h 5 min", "65 min", "2min30", "2 min 30 s", "1h 2min 3s" → seconds.
  function parseDuration(s) {
    const t = strip(s).toLowerCase().replace(/mn/g, 'min').replace(/minutes?/g, 'min').replace(/heures?/g, 'h').replace(/secondes?|sec/g, 's');
    if (!/^(\d+(h|min|s)?)+$/.test(t)) return null;
    const unitSec = { h: 3600, min: 60, s: 1 };
    const next = { h: 'min', min: 's' }, rank = { h: 0, min: 1, s: 2 };
    let total = 0, prev = null;
    for (const [, num, unit] of t.matchAll(/(\d+)(h|min|s)?/g)) {
      const u = unit || next[prev];
      if (!u || (prev && rank[u] <= rank[prev])) return null;   // "1h5h", "30s1h" are not durations
      total += Number(num) * unitSec[u];
      prev = u;
    }
    return total;
  }

  function parseDivision(input) {
    if (input && typeof input === 'object') {
      const q = parseNumber(input.q), r = parseNumber(input.r);
      return Number.isInteger(q) && Number.isInteger(r) ? { q, r } : null;
    }
    const nums = String(input ?? '').match(/\d+/g);
    return nums && nums.length === 2 ? { q: Number(nums[0]), r: Number(nums[1]) } : null;
  }

  const ok = { status: 'ok' }, wrong = { status: 'wrong' };
  const invalid = msg => ({ status: 'invalid', msg });

  const kinds = {
    number: {
      hint: a => `Un nombre${a.unit ? ` (en ${a.unit})` : ''} — virgule ou point acceptés`,
      check(a, input) {
        const v = parseNumber(input);
        if (v === null) return invalid('Écris un nombre, par exemple 12 ou 3,5.');
        return eq(v, a.value) ? ok : wrong;
      },
      show: a => fmt(a.value) + (a.unit ? ` ${a.unit}` : ''),
      validate: a => (Number.isFinite(a.value) ? [] : ['value is not finite']),
    },
    fraction: {
      hint: a => (a.simplified ? 'Une fraction simplifiée au maximum, ex : 3/4' : 'Une fraction, ex : 3/4 (ou un nombre entier)'),
      check(a, input) {
        const f = parseFraction(input);
        if (!f) return invalid('Écris une fraction avec /, par exemple 3/4.');
        if (f.n * a.d !== a.n * f.d) return wrong;
        if (a.simplified && gcd(f.n, f.d) !== 1) return invalid('C’est bien égal… mais on peut encore simplifier !');
        return ok;
      },
      show: a => (a.d === 1 ? fmt(a.n) : frac(a.n, a.d)),
      validate: a => (Number.isInteger(a.n) && Number.isInteger(a.d) && a.d > 0 && (!a.simplified || gcd(a.n, a.d) === 1) ? [] : ['bad fraction']),
    },
    choice: {
      hint: a => `Clique sur la bonne réponse (ou touche 1 à ${a.options.length})`,
      check: (a, input) => (Number.isInteger(input) && input >= 0 && input < a.options.length ? (input === a.correct ? ok : wrong) : invalid('Choisis une réponse.')),
      show: a => a.options[a.correct],
      validate: a => {
        const errs = [];
        if (!(a.options.length >= 2 && a.options.length <= 6)) errs.push('options count');
        if (!(Number.isInteger(a.correct) && a.correct >= 0 && a.correct < a.options.length)) errs.push('correct index');
        if (new Set(a.options).size !== a.options.length) errs.push('duplicate options: ' + a.options.join(' | '));
        return errs;
      },
    },
    division: {
      hint: () => 'Le quotient et le reste',
      check(a, input) {
        const d = parseDivision(input);
        if (!d) return invalid('Écris le quotient et le reste (deux nombres entiers).');
        return d.q === a.q && d.r === a.r ? ok : wrong;
      },
      show: a => `quotient ${fmt(a.q)}, reste ${fmt(a.r)}`,
      validate: a => (Number.isInteger(a.q) && Number.isInteger(a.r) && a.q >= 0 && a.r >= 0 ? [] : ['bad division']),
    },
    duration: {
      hint: a => ({ hm: 'Ex : 1 h 05 min (ou 1h05)', ms: 'Ex : 2 min 30 s', hms: 'Ex : 1 h 2 min 3 s' }[a.units] || 'Une durée avec ses unités'),
      check(a, input) {
        const s = parseDuration(input);
        if (s === null) return invalid('Écris une durée avec ses unités, par exemple 1 h 05 min.');
        return s === a.s ? ok : wrong;
      },
      show: a => formatDuration(a.s),
      validate: a => (Number.isInteger(a.s) && a.s >= 0 ? [] : ['bad duration']),
    },
    order: {
      hint: a => `Clique dans l’ordre ${a.sep === '>' ? 'décroissant' : 'croissant'} (ou touches 1 à ${a.items.length})`,
      check(a, input) {
        if (!Array.isArray(input) || input.length !== a.items.length) return invalid('Range tous les nombres.');
        return input.every((v, i) => v === a.correct[i]) ? ok : wrong;
      },
      show: a => a.correct.map(i => a.items[i]).join(` ${a.sep || '<'} `),
      validate: a => (a.correct.length === a.items.length && new Set(a.correct).size === a.items.length ? [] : ['bad order']),
    },
  };

  function formatDuration(s) {
    const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60;
    const parts = [];
    if (h) parts.push(`${h} h`);
    if (m || (h && sec)) parts.push(`${String(m).padStart(h ? 2 : 1, '0')} min`);
    if (sec || !parts.length) parts.push(`${sec} s`);
    return parts.join(' ');
  }

  const kindOf = a => kinds[a.kind] || (() => { throw new Error('Unknown answer kind ' + a.kind); })();

  M.answer = {
    parseNumber, parseFraction, parseDuration, parseDivision, formatDuration,
    check: (a, input) => kindOf(a).check(a, input),
    show: a => kindOf(a).show(a),
    hint: a => kindOf(a).hint(a),
    validate: a => (kinds[a.kind] ? kinds[a.kind].validate(a) : ['unknown kind ' + a.kind]),
    // The input a perfect pupil would give — used by tests.
    perfectInput(a) {
      switch (a.kind) {
        case 'number': return fmt(a.value);
        case 'fraction': return `${a.n}/${a.d}`;
        case 'choice': return a.correct;
        case 'division': return { q: String(a.q), r: String(a.r) };
        case 'duration': return formatDuration(a.s);
        case 'order': return a.correct.slice();
      }
    },
  };
})();
