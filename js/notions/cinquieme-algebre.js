// 5e chapters "Nombres relatifs" and "Calcul littéral" (relatifs, puissances, calcul littéral, équations).
(function () {
  'use strict';
  const M = globalThis.M;
  const { fmt, dec, add, sub, mul, div, gcd } = M.u;
  const { hole, frac } = M.h;
  const { Q, num, choice, fixedChoice, order } = M.kit;
  const S = M.svg, R = M.svg.raw;

  // ---------- Shared helpers ----------
  const abs = Math.abs;
  // A relative number written after an operation sign: parentheses when negative, e.g. 5 + (−3).
  const P = x => (x < 0 ? `(${fmt(x)})` : fmt(x));
  // Non-zero random integer.
  const nz = (rng, a, b) => { let v; do v = rng.int(a, b); while (v === 0); return v; };
  const sup = (b, e) => `${b}<sup>${e}</sup>`;
  const X = '<i>x</i>';
  const XS = '<tspan font-style="italic">x</tspan>';   // inside SVG (an HTML <i> would break out of the svg)
  const it = s => `<i>${s}</i>`;
  // a·v (a ≠ 0) as written in algebra: x, −x, 3x, 1,5x.
  const coef = (a, v = X) => (a === 1 ? v : a === -1 ? `−${v}` : `${fmt(a)}${v}`);
  // ax + b, with the usual conventions (no "+ −", no "1x", no "0x").
  function lin(a, b, v = X) {
    let s = a === 0 ? '' : coef(a, v);
    if (b !== 0) s += s ? (b > 0 ? ` + ${fmt(b)}` : ` − ${fmt(-b)}`) : fmt(b);
    return s || '0';
  }
  // A list of signed terms [coef, variable] (variable '' for a constant): 3x + 5 − 1,2x − 1.
  function terms(list) {
    return list.map(([c, v], i) => {
      const body = v ? coef(abs(c), v) : fmt(abs(c));
      return i === 0 ? (c < 0 ? `−${body}` : body) : ` ${c < 0 ? '−' : '+'} ${body}`;
    }).join('');
  }
  // "a × x + b" with x replaced by a value, then evaluated (a, x ≥ 0).
  const subst = (a, b, x) => `${fmt(a)} × ${fmt(x)}${b === 0 ? '' : b > 0 ? ` + ${fmt(b)}` : ` − ${fmt(-b)}`}`;

  // Why a + b has this value (a, b non-zero): the two rules of 5e.
  function sumWhy(a, b) {
    const r = add(a, b);
    if ((a > 0) === (b > 0)) {
      return `Même signe : on ajoute les distances à zéro (${fmt(abs(a))} + ${fmt(abs(b))} = ${fmt(abs(r))}) et on garde le signe ${a < 0 ? '−' : '+'} : <b>${fmt(r)}</b>.`;
    }
    if (r === 0) return `Ce sont deux nombres opposés : leur somme est <b>0</b>.`;
    const big = Math.max(abs(a), abs(b)), small = Math.min(abs(a), abs(b)), far = abs(a) > abs(b) ? a : b;
    return `Signes contraires : on soustrait les distances à zéro (${fmt(big)} − ${fmt(small)} = ${fmt(abs(r))}) et on prend le signe du nombre le plus loin de zéro (${fmt(far)}) : <b>${fmt(r)}</b>.`;
  }

  // Number line with only 0 and 1 written (the pupil must find the step).
  function line01({ from, to, minor = 0, marks, width = 600 }) {
    return S.numberLine({ from, to, major: 1, minor, labels: [{ v: 0, text: '0' }, { v: 1, text: '1' }], marks, width });
  }

  // Integer number line with jumps drawn as arcs: start, then moves (e.g. +5 then −7).
  function jumps(from, to, start, moves) {
    const W = 600, pad = 30, y = 92, Xp = v => pad + ((v - from) / (to - from)) * (W - 2 * pad);
    let b = R.line(pad - 12, y, W - pad + 12, y) + `<polygon points="${W - pad + 12},${y - 5} ${W - pad + 20},${y} ${W - pad + 12},${y + 5}" class="s-solid"/>`;
    for (let v = from; v <= to; v++) b += R.line(Xp(v), y - 7, Xp(v), y + 7) + R.text(Xp(v), y + 24, fmt(v), { size: 13 });
    let cur = start;
    moves.forEach((m, i) => {
      const nx = cur + m, x1 = Xp(cur), x2 = Xp(nx), h = 22 + 34 * i;
      b += `<path d="M${x1},${y - 6} Q${(x1 + x2) / 2},${y - 6 - 2 * h} ${x2},${y - 6}" class="s-accent-line s-nofill"/>`;
      b += R.text((x1 + x2) / 2, y - 10 - h, `${m > 0 ? '+' : '−'} ${fmt(abs(m))}`, { cls: 's-text s-bold', size: 14 });
      cur = nx;
    });
    b += `<circle cx="${Xp(start)}" cy="${y}" r="5" class="s-dot"/><circle cx="${Xp(cur)}" cy="${y}" r="5" class="s-accent"/>`;
    return R.svg(W, 126, b);
  }

  // Vertical thermometer from −10 °C to 10 °C showing t.
  function thermo(t) {
    const top = 20, bot = 220, cx = 60, Y = v => bot - ((v + 10) / 20) * (bot - top);
    let b = `<rect x="${cx - 9}" y="${top - 8}" width="18" height="${bot - top + 16}" rx="9" class="s-empty s-line"/>`;
    b += `<rect x="${cx - 4}" y="${Y(t)}" width="8" height="${bot + 8 - Y(t)}" class="s-accent"/>`;
    b += `<circle cx="${cx}" cy="${bot + 18}" r="13" class="s-accent"/>`;
    for (let v = -10; v <= 10; v++) {
      b += R.line(cx + 12, Y(v), cx + (v % 5 === 0 ? 24 : 17), Y(v));
      if (v % 5 === 0) b += R.text(cx + 30, Y(v) + 5, fmt(v), { anchor: 'start', size: 13 });
    }
    b += R.line(cx + 12, Y(0), cx + 70, Y(0), 's-line s-dash');
    b += R.text(cx + 78, Y(t) + 5, `${fmt(t)} °C`, { anchor: 'start', cls: 's-text s-bold' });
    return R.svg(190, 250, b);
  }

  // Balance: left plate holds a box "x" and `l` unit weights, right plate `r` unit weights.
  function balance(l, r) {
    let b = R.line(30, 70, 330, 70, 's-line s-thick') + R.poly([[180, 70], [160, 120], [200, 120]], 's-soft s-line');
    b += R.line(20, 72, 140, 72, 's-line s-thick') + R.line(220, 72, 340, 72, 's-line s-thick');
    b += `<rect x="26" y="34" width="36" height="36" class="s-fill s-line"/>` + R.text(44, 58, XS, { cls: 's-text s-bold' });
    for (let i = 0; i < l; i++) b += `<rect x="${68 + (i % 4) * 18}" y="${54 - Math.floor(i / 4) * 18}" width="15" height="15" class="s-soft s-line"/>`;
    for (let i = 0; i < r; i++) b += `<rect x="${224 + (i % 6) * 18}" y="${54 - Math.floor(i / 6) * 18}" width="15" height="15" class="s-soft s-line"/>`;
    return R.svg(360, 130, b);
  }

  // n × n grid of squares (a square number).
  function squareGrid(n, c = 22) {
    let b = '';
    for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) b += `<rect x="${10 + i * c}" y="${10 + j * c}" width="${c}" height="${c}" class="s-soft s-line"/>`;
    return R.svg(n * c + 20, n * c + 20, b);
  }

  // A 3 × 3 × 3 cube drawn in oblique perspective, with its small cubes.
  function cube3() {
    const x0 = 20, y0 = 50, s = 90, dx = 42, dy = -32, t = s / 3;
    let b = R.poly([[x0, y0], [x0 + dx, y0 + dy], [x0 + s + dx, y0 + dy], [x0 + s, y0]], 's-soft2 s-line');
    b += R.poly([[x0 + s, y0], [x0 + s + dx, y0 + dy], [x0 + s + dx, y0 + s + dy], [x0 + s, y0 + s]], 's-soft2 s-line');
    b += `<rect x="${x0}" y="${y0}" width="${s}" height="${s}" class="s-soft s-line"/>`;
    for (let i = 1; i < 3; i++) {
      b += R.line(x0 + i * t, y0, x0 + i * t, y0 + s) + R.line(x0, y0 + i * t, x0 + s, y0 + i * t);
      b += R.line(x0 + i * t, y0, x0 + i * t + dx, y0 + dy) + R.line(x0 + (i * dx) / 3, y0 + (i * dy) / 3, x0 + s + (i * dx) / 3, y0 + (i * dy) / 3);
      b += R.line(x0 + s + (i * dx) / 3, y0 + (i * dy) / 3, x0 + s + (i * dx) / 3, y0 + s + (i * dy) / 3) + R.line(x0 + s, y0 + i * t, x0 + s + dx, y0 + dy + i * t);
    }
    return R.svg(x0 + s + dx + 20, y0 + s + 20, b);
  }

  // Rectangle k × (x + b) cut in two: area model with a letter.
  function letterArea(k, bb) {
    const L = 40, T = 30, wx = 190, wb = 90, H = 80;
    let b = `<rect x="${L}" y="${T}" width="${wx}" height="${H}" class="s-fill s-line"/><rect x="${L + wx}" y="${T}" width="${wb}" height="${H}" class="s-soft s-line"/>`;
    b += R.text(L + wx / 2, T - 9, XS) + R.text(L + wx + wb / 2, T - 9, fmt(bb)) + R.text(L - 14, T + H / 2 + 5, fmt(k));
    b += R.text(L + wx / 2, T + H / 2 + 5, `${fmt(k)} × ${XS}`, { cls: 's-text s-bold' }) + R.text(L + wx + wb / 2, T + H / 2 + 5, `${fmt(k)} × ${fmt(bb)}`, { cls: 's-text s-bold' });
    return R.svg(L + wx + wb + 20, T + H + 14, b);
  }

  const cmpWhy = (a, b) => {
    if (a === b) return 'Les deux nombres sont égaux.';
    if ((a < 0) !== (b < 0)) return 'Un nombre négatif est toujours plus petit qu’un nombre positif.';
    if (a < 0) return `Les deux sont négatifs : le plus grand est le plus proche de zéro (distances ${fmt(abs(a))} et ${fmt(abs(b))}).`;
    return 'Les deux sont positifs : on les compare comme d’habitude.';
  };
  const cmpSign = (a, b) => (a < b ? '<' : a > b ? '>' : '=');
  const cmpHtml = s => (s === '<' ? '&lt;' : s === '>' ? '&gt;' : '=');

  // ===================== NOMBRES RELATIFS : REPÉRER, COMPARER =====================
  M.notion('relatifs-reperage', {
    lesson: {
      retenir: 'Un <b>nombre relatif</b> est un nombre <b>positif</b> (supérieur ou égal à 0, comme 3 ou 2,5) ou <b>négatif</b> (inférieur ou égal à 0, comme −4 ou −0,7). 0 est à la fois positif et négatif ; un nombre <b>strictement</b> positif (ou strictement négatif) est différent de 0.<br>Deux nombres <b>opposés</b>, comme 3 et −3, sont à la même distance de 0, de part et d’autre de 0. Cette distance à zéro s’appelle la <b>valeur absolue</b> : la valeur absolue de −3 (et de 3) est 3.<br>Sur une droite graduée, le plus grand nombre est <b>le plus à droite</b>. Entre deux nombres négatifs, le plus grand est donc <b>le plus proche de 0</b>.',
      explication: `${S.numberLine({ from: -5, to: 5, major: 1, marks: [{ v: -3, label: 'A' }, { v: 3, label: 'B' }, { v: -1, label: 'C' }] })}<p>Le point A a pour <b>abscisse</b> −3, B a pour abscisse 3 : −3 et 3 sont <b>opposés</b>, tous les deux à 3 graduations de 0. Le point C a pour abscisse −1.</p><p>C est plus à droite que A, donc <b>−1 &gt; −3</b> : −1 est plus proche de 0.</p>`,
      methode: [
        'Pour lire une abscisse : repère 0, trouve ce que vaut une graduation, puis compte les graduations depuis 0. À gauche de 0, le nombre est négatif.',
        'Pour comparer deux relatifs de signes contraires : le positif est le plus grand.',
        'Pour comparer deux négatifs : compare leurs distances à zéro ; celui qui a la plus grande distance est le plus petit.',
        'Pour ranger : place d’abord les négatifs (du plus loin de 0 au plus proche), puis les positifs.',
      ],
      exemples: [
        { q: 'Opposé et valeur absolue de −6,5', r: 'L’opposé de −6,5 est <b>6,5</b> ; sa valeur absolue (distance à zéro) est <b>6,5</b>.' },
        { q: 'Compare −7 et −2', r: '7 &gt; 2, donc −7 est plus loin de 0 : <b>−7 &lt; −2</b>.' },
        { q: 'Range dans l’ordre croissant : 1,5 ; −3 ; 0 ; −0,5', r: '<b>−3 &lt; −0,5 &lt; 0 &lt; 1,5</b>.' },
      ],
      astuces: ['Pense au thermomètre : −10 °C est plus froid que −2 °C, donc −10 &lt; −2.'],
      erreurs: [
        '« −7 &gt; −2 car 7 &gt; 2 » : FAUX. Chez les négatifs, c’est l’inverse : −7 &lt; −2.',
        'Oublier le signe − en lisant une abscisse à gauche de 0.',
      ],
    },
    generate(level, rng) {
      if (level === 1) {
        const t = rng.int(0, 3);
        if (t === 0) {
          const v = rng.chance(0.75) ? -rng.int(1, 6) : rng.int(2, 6);
          return Q(`rr1:lire:${v}`, `Quelle est l’abscisse du point A ?${line01({ from: -6, to: 6, marks: [{ v, label: 'A' }] })}`, num(v),
            'Une graduation vaut 1. Compte depuis 0, et regarde de quel côté de 0 se trouve A.',
            `A est à ${abs(v)} graduation${abs(v) > 1 ? 's' : ''} ${v < 0 ? 'à gauche' : 'à droite'} de 0 : son abscisse est <b>${fmt(v)}</b>.`);
        }
        if (t === 1) {
          const a = nz(rng, -40, 40);
          return Q(`rr1:opp:${a}`, `Quel est l’opposé de ${fmt(a)} ?`, num(-a), 'Deux nombres opposés sont à la même distance de 0, de part et d’autre de 0.',
            `${fmt(a)} est à ${fmt(abs(a))} de 0 ; de l’autre côté de 0, on trouve <b>${fmt(-a)}</b>.`);
        }
        if (t === 2) {
          const a = nz(rng, -15, 15);
          let b; do b = nz(rng, -15, 15); while (b === a || (a > 0 && b > 0));
          const s = cmpSign(a, b);
          return Q(`rr1:cmp:${a}:${b}`, `Compare : ${fmt(a)} ${hole} ${fmt(b)}`, fixedChoice(['<', '=', '>'], s), 'Imagine les deux nombres sur une droite graduée : le plus grand est le plus à droite.',
            `${cmpWhy(a, b)} Donc <b>${fmt(a)} ${cmpHtml(s)} ${fmt(b)}</b>.`);
        }
        const ctx = rng.pick([
          { s: 'Le thermomètre indique {n} degrés sous zéro. Quelle est la température ?', u: '°C', neg: true },
          { s: 'Un plongeur est à {n} m sous le niveau de la mer. Quelle est son altitude ?', u: 'm', neg: true },
          { s: 'Un parking a {n} étages souterrains. Quel numéro porte l’étage le plus bas (le rez-de-chaussée est le niveau 0) ?', u: '', neg: true },
          { s: 'Un randonneur est à {n} m au-dessus du niveau de la mer. Quelle est son altitude ?', u: 'm', neg: false },
        ]);
        const n = ctx.u === 'm' ? rng.int(2, 60) * 5 : rng.int(2, 15), v = ctx.neg ? -n : n;
        return Q(`rr1:ctx:${ctx.s.slice(0, 12)}:${n}`, ctx.s.replace('{n}', fmt(n)), num(v, ctx.u || undefined), 'Sous zéro (ou sous le niveau de la mer), on utilise un nombre négatif.',
          `${ctx.neg ? 'Sous le niveau 0, le nombre est négatif' : 'Au-dessus du niveau 0, le nombre est positif'} : <b>${fmt(v)}${ctx.u ? ' ' + ctx.u : ''}</b>.`);
      }
      if (level === 2) {
        const t = rng.int(0, 4);
        if (t === 0) {
          const v = rng.chance(0.8) ? -dec((2 * rng.int(0, 3) + 1) * 5, 1) : dec(rng.pick([5, 15, 25]), 1);
          return Q(`rr2:lire:${v}`, `Quelle est l’abscisse du point A ?${line01({ from: -4, to: 3, minor: 2, marks: [{ v, label: 'A' }] })}`, num(v),
            'Combien de petites graduations entre 0 et 1 ? Déduis-en ce que vaut une petite graduation.',
            `L’unité est partagée en 2 : une petite graduation vaut 0,5. A est à ${abs(v) * 2} petites graduations ${v < 0 ? 'à gauche' : 'à droite'} de 0 : son abscisse est <b>${fmt(v)}</b>.`);
        }
        if (t === 1) {
          const v = -rng.int(1, 5);
          const pos = rng.shuffle([v, -v, v - 1, v === -1 ? 2 : v + 1]);
          const letters = ['A', 'B', 'C', 'D'], good = letters[pos.indexOf(v)];
          const fig = line01({ from: -6, to: 6, marks: pos.map((p, i) => ({ v: p, label: letters[i] })) });
          return Q(`rr2:placer:${pos.join(',')}`, `Quel point a pour abscisse ${fmt(v)} ?${fig}`, fixedChoice(letters, good), 'Une graduation vaut 1 ; les nombres négatifs sont à gauche de 0.',
            `${fmt(v)} est à ${abs(v)} graduation${abs(v) > 1 ? 's' : ''} à gauche de 0 : c’est le point <b>${good}</b>.`);
        }
        if (t === 2) {
          const a = -dec(rng.int(1, 99), 1);
          let b; do b = rng.chance(0.8) ? -dec(rng.int(1, 99), 1) : dec(rng.int(1, 99), 1); while (b === a);
          const s = cmpSign(a, b);
          return Q(`rr2:cmp:${a}:${b}`, `Compare : ${fmt(a)} ${hole} ${fmt(b)}`, fixedChoice(['<', '=', '>'], s), 'Deux négatifs : le plus grand est le plus proche de 0.',
            `${cmpWhy(a, b)} Donc <b>${fmt(a)} ${cmpHtml(s)} ${fmt(b)}</b>.`);
        }
        if (t === 3) {
          const set = new Set();
          while (set.size < 4) set.add(nz(rng, -20, 20));
          const values = rng.shuffle([...set]);
          if (!values.some(v => v < 0)) values[0] = -abs(values[0]) - 21;
          const desc = rng.chance(0.4), ans = order(values, fmt, { desc });
          return Q(`rr2:ord:${values.join(';')}:${desc}`, `Range dans l’ordre <b>${desc ? 'décroissant' : 'croissant'}</b> :`, ans, 'Commence par les négatifs : le plus loin de 0 est le plus petit.',
            `Les négatifs sont plus petits que les positifs, et parmi les négatifs, le plus loin de 0 est le plus petit : <b>${M.answer.show(ans)}</b>.`);
        }
        const a = -dec(rng.int(11, 199), 1);
        if (rng.chance(0.5)) {
          return Q(`rr2:abs:${a}`, `Quelle est la valeur absolue (la distance à zéro) de ${fmt(a)} ?`, num(-a), 'La valeur absolue est une distance : elle n’est jamais négative.',
            `${fmt(a)} est à ${fmt(-a)} unités de 0 : sa valeur absolue est <b>${fmt(-a)}</b>.`);
        }
        const opts = ['strictement positif', 'strictement négatif', 'égal à 0'];
        const v = rng.pick([a, -a, 0]), good = v > 0 ? opts[0] : v < 0 ? opts[1] : opts[2];
        return Q(`rr2:signe:${v}`, `Le nombre ${fmt(v)} est :`, fixedChoice(opts, good), '« Strictement » veut dire : et différent de 0.',
          v === 0 ? 'Le nombre 0 est à la fois positif et négatif, mais il n’est ni strictement positif ni strictement négatif : il est <b>égal à 0</b>.' : `${fmt(v)} est ${v > 0 ? 'à droite' : 'à gauche'} de 0 : il est <b>${good}</b>.`);
      }
      // level 3
      const t = rng.int(0, 3);
      if (t === 0) {
        const quarters = rng.chance(0.4), v = quarters ? -dec(rng.pick([25, 75, 125, 175, 225, 275]), 2) : -dec(rng.pick([1, 2, 3, 4, 6, 7, 8, 9]) + 10 * rng.int(0, 2), 1);
        const step = quarters ? 0.25 : 0.1, n = Math.round(abs(v) / step);
        return Q(`rr3:lire:${v}`, `Quelle est l’abscisse du point A ?${line01({ from: -3, to: 2, minor: quarters ? 4 : 10, marks: [{ v, label: 'A' }] })}`, num(v),
          'Compte les petits intervalles entre 0 et 1 pour trouver ce que vaut une petite graduation.',
          `L’unité est partagée en ${quarters ? 4 : 10} : une petite graduation vaut ${fmt(step)}. A est à ${n} petites graduations à gauche de 0 : ${n} × ${fmt(step)} = ${fmt(abs(v))}, donc l’abscisse de A est <b>${fmt(v)}</b>.`);
      }
      if (t === 1) {
        const e = rng.int(0, 5), d = rng.int(1, 9);
        const pool = [sub(-e, dec(d, 1)), sub(-e, dec(d, 2)), sub(-e, dec(d * 11, 2)), -(e + 1), dec(d, 1), sub(-e - 1, dec(rng.int(1, 9), 1)), add(e, dec(d, 2))];
        const values = rng.sample([...new Set(pool.map(v => (v === 0 ? 0 : v)))].filter(v => v !== 0), 5);
        const desc = rng.chance(0.5), ans = order(values, fmt, { desc });
        return Q(`rr3:ord:${values.join(';')}:${desc}`, `Range dans l’ordre <b>${desc ? 'décroissant' : 'croissant'}</b> :`, ans, 'Pour les négatifs, compare les distances à zéro en écrivant autant de décimales : la plus grande distance donne le plus petit nombre.',
          `Parmi les négatifs, le plus loin de 0 est le plus petit ; les positifs viennent ensuite : <b>${M.answer.show(ans)}</b>.`);
      }
      if (t === 2) {
        const e = rng.int(0, 9), d = rng.int(1, 9);
        const pair = rng.pick([[sub(-e, dec(d, 1)), sub(-e, dec(d, 2))], [sub(-e, dec(d, 1)), sub(-e, dec(d * 10 + rng.int(1, 9), 2))], [sub(-e, dec(d * 11, 2)), sub(-e, dec(d, 1))]]);
        const [a, b] = rng.chance(0.5) ? pair : [pair[1], pair[0]];
        const s = cmpSign(a, b);
        return Q(`rr3:cmp:${a}:${b}`, `Compare : ${fmt(a)} ${hole} ${fmt(b)}`, fixedChoice(['<', '=', '>'], s), 'Écris les deux distances à zéro avec autant de décimales, puis souviens-toi que chez les négatifs, l’ordre s’inverse.',
          `${cmpWhy(a, b)} Donc <b>${fmt(a)} ${cmpHtml(s)} ${fmt(b)}</b>.`);
      }
      const cities = rng.sample(['Oslo', 'Moscou', 'Montréal', 'Helsinki', 'Varsovie', 'Strasbourg', 'Reykjavik'], 4);
      const temps = [];
      while (temps.length < 4) { const v = -dec(rng.int(5, 189), 1); if (!temps.includes(v)) temps.push(v); }
      const coldest = rng.chance(0.5), target = coldest ? Math.min(...temps) : Math.max(...temps);
      const opts = cities.map((c, i) => `${c} (${fmt(temps[i])} °C)`), good = opts[temps.indexOf(target)];
      return Q(`rr3:villes:${temps.join(';')}:${coldest}`, `Quelle ville a la température la plus ${coldest ? 'basse' : 'haute'} ?`, fixedChoice(opts, good), 'Toutes les températures sont négatives : compare leurs distances à zéro.',
        `La température la plus ${coldest ? 'basse est celle qui est la plus loin' : 'haute est celle qui est la plus proche'} de 0 : <b>${good}</b>.`);
    },
  });

  // ===================== ADDITIONNER ET SOUSTRAIRE DES RELATIFS =====================
  // Chain "a op (b) op (c)…" : ops are '+' or '−', terms non-zero.
  function chain(rng, n, decimals) {
    const v = () => (decimals ? nz(rng, -99, 99) / 10 : nz(rng, -15, 15));
    const ts = Array.from({ length: n }, v), ops = ts.map(() => rng.pick(['+', '−']));
    const k = rng.int(1, n - 1); if (ts[k] > 0) ts[k] = -ts[k];
    const shown = ts.map((t, i) => (i === 0 ? fmt(t) : ` ${ops[i]} ${P(t)}`)).join('');
    const eff = ts.map((t, i) => (i === 0 || ops[i] === '+' ? t : -t));
    const simp = eff.map((e, i) => (i === 0 ? fmt(e) : ` ${e < 0 ? '−' : '+'} ${fmt(abs(e))}`)).join('');
    const pos = eff.filter(e => e > 0).reduce(add, 0), neg = eff.filter(e => e < 0).reduce(add, 0);
    return { ts, ops, shown, simp, pos, neg, value: add(pos, neg) };
  }

  M.notion('relatifs-addition', {
    lesson: {
      retenir: '<b>Additionner</b> deux relatifs :<br>• de <b>même signe</b> : on additionne leurs distances à zéro et on garde le signe commun (−3 + (−5) = −8) ;<br>• de <b>signes contraires</b> : on soustrait leurs distances à zéro et on prend le signe de celui qui est le plus loin de zéro (−7 + 4 = −3).<br><b>Soustraire</b> un nombre, c’est <b>ajouter son opposé</b> : 5 − (−3) = 5 + 3 = 8.<br>Les <b>parenthèses</b> sont indispensables quand un nombre négatif suit un signe + ou − : on écrit 5 + (−3), jamais 5 + −3.',
      explication: `${jumps(-6, 6, -2, [5, -7])}<p>On part de −2, on avance de 5 (on arrive à 3), puis on recule de 7 : on arrive à <b>−4</b>. Donc −2 + 5 − 7 = −4.</p><p>Ajouter un nombre positif fait avancer vers la droite, ajouter un nombre négatif fait reculer vers la gauche.</p>`,
      methode: [
        'Transforme chaque soustraction en addition de l’opposé : a − (−b) = a + b et a − b = a + (−b).',
        'Simplifie l’écriture : + (−3) s’écrit − 3, et − (−3) s’écrit + 3.',
        'Dans une longue suite, regroupe les nombres positifs d’un côté, les négatifs de l’autre, puis fais la somme des deux résultats.',
      ],
      exemples: [
        { q: '−9 + 4', r: 'Signes contraires : 9 − 4 = 5, et −9 est plus loin de 0 : <b>−5</b>.' },
        { q: '3 − (−6)', r: '3 + 6 = <b>9</b>.' },
        { q: '−2,5 + 7 − (−1) + (−4)', r: '= −2,5 + 7 + 1 − 4. Positifs : 8 ; négatifs : −6,5. Résultat : <b>1,5</b>.' },
      ],
      astuces: ['Un compte en banque aide : avoir une dette de 3 € (−3) et en ajouter une de 5 € (−5), c’est une dette de 8 € (−8).'],
      erreurs: [
        '−3 + (−5) = 8 : FAUX, on garde le signe commun : −8.',
        '5 − (−3) = 2 : FAUX, soustraire −3 revient à ajouter 3 : 8.',
        'Écrire deux signes à la suite (5 + −3) : il faut des parenthèses.',
      ],
    },
    generate(level, rng) {
      if (level === 1) {
        const t = rng.int(0, 2);
        if (t === 0) {
          const a = nz(rng, -10, 10);
          let b; do b = nz(rng, -10, 10); while (a > 0 && b > 0);
          return Q(`ra1:${a}+${b}`, `${fmt(a)} + ${P(b)} = ?`, num(add(a, b)), 'Les deux nombres ont-ils le même signe ? Pense à leurs distances à zéro.', sumWhy(a, b));
        }
        if (t === 1) {
          const a = rng.int(1, 9), b = a + rng.int(1, 9);
          return Q(`ra1:${a}-${b}`, `${a} − ${b} = ?`, num(a - b), 'Soustraire un nombre, c’est ajouter son opposé.',
            `${a} − ${b} = ${a} + (−${b}). ${sumWhy(a, -b)}`);
        }
        const up = rng.chance(0.5), t0 = up ? -rng.int(1, 9) : rng.int(-6, 6), d = rng.int(2, 12), r = up ? t0 + d : t0 - d;
        return Q(`ra1:temp:${t0}:${up}:${d}`, `Le matin, il fait ${fmt(t0)} °C. Dans la journée, la température ${up ? 'monte' : 'baisse'} de ${d} °C. Quelle température fait-il alors ?`, num(r, '°C'),
          up ? 'Quand la température monte, on ajoute.' : 'Quand la température baisse, on soustrait.',
          `${fmt(t0)} ${up ? '+' : '−'} ${d} = <b>${fmt(r)}</b> °C.`);
      }
      if (level === 2) {
        const t = rng.int(0, 4);
        if (t === 0) {
          const a = nz(rng, -20, 20), b = -rng.int(1, 20);
          return Q(`ra2:${a}-${b}`, `${fmt(a)} − ${P(b)} = ?`, num(sub(a, b)), 'Soustraire un nombre, c’est ajouter son opposé.',
            `${fmt(a)} − ${P(b)} = ${fmt(a)} + ${fmt(-b)}. ${sumWhy(a, -b)}`);
        }
        if (t === 1) {
          const a = nz(rng, -99, 99) / 10, minus = rng.chance(0.5), b = (a > 0 || rng.chance(0.5) ? -1 : 1) * rng.int(1, 99) / 10;
          const bb = minus ? -b : b, r = add(a, bb);
          return Q(`ra2:dec:${a}${minus ? '-' : '+'}${b}`, `${fmt(a)} ${minus ? '−' : '+'} ${P(b)} = ?`, num(r), 'Les deux nombres ont-ils le même signe ? Pense à leurs distances à zéro.',
            minus ? `${fmt(a)} − ${P(b)} = ${fmt(a)} + ${P(bb)}. ${sumWhy(a, bb)}` : sumWhy(a, b));
        }
        if (t === 2) {
          const s = rng.int(-3, 4), u = rng.int(4, 9), r = rng.chance(0.7) ? -rng.int(1, 5) : rng.int(0, s + u - 1), dn = s + u - r;
          return Q(`ra2:asc:${s}:${u}:${dn}`, `Un ascenseur est au niveau ${fmt(s)} (le rez-de-chaussée est le niveau 0). Il monte de ${u} étages, puis descend de ${dn} étages. À quel niveau arrive-t-il ?`, num(r),
            'Monter, c’est ajouter ; descendre, c’est soustraire.',
            `${fmt(s)} + ${u} − ${dn} = ${fmt(s + u)} − ${dn} = <b>${fmt(r)}</b>.`);
        }
        if (t === 3) {
          const ts = [nz(rng, -15, 15), -rng.int(1, 15), nz(rng, -15, 15)];
          if (rng.chance(0.5)) [ts[0], ts[1]] = [ts[1], ts[0]];
          const shown = ts.map((x, i) => (i === 0 ? fmt(x) : ` + ${P(x)}`)).join('');
          const pos = ts.filter(x => x > 0).reduce(add, 0), neg = ts.filter(x => x < 0).reduce(add, 0), r = add(pos, neg);
          return Q(`ra2:3:${ts.join(',')}`, `${shown} = ?`, num(r), 'Regroupe les nombres positifs d’un côté et les négatifs de l’autre.',
            `Positifs : ${fmt(pos)} ; négatifs : ${fmt(neg)}. ${fmt(pos)} + ${P(neg)} = <b>${fmt(r)}</b>.`);
        }
        const a = rng.int(2, 9), b = rng.int(2, 9), plus = rng.chance(0.5), op = plus ? '+' : '−';
        const good = `${a} ${op} (−${b})`;
        return Q(`ra2:par:${a}${op}${b}`, `Laquelle de ces écritures est correcte ?`, choice(rng, good, [`${a} ${op} −${b}`, `${a} ${op}− ${b}`, `(${a} ${op}) −${b}`]),
          'Deux signes ne doivent jamais se suivre.',
          `Un nombre négatif qui suit un signe + ou − doit être entre parenthèses : <b>${good}</b>.`);
      }
      // level 3
      const t = rng.int(0, 3);
      if (t === 0) {
        const c = chain(rng, 4, rng.chance(0.5));
        return Q(`ra3:${c.shown}`, `${c.shown} = ?`, num(c.value), 'Simplifie d’abord l’écriture (enlève les parenthèses), puis regroupe les positifs et les négatifs.',
          `On simplifie : ${c.simp}.<br>Positifs : ${fmt(c.pos)} ; négatifs : ${fmt(c.neg)}.<br>${fmt(c.pos)} + ${P(c.neg)} = <b>${fmt(c.value)}</b>.`);
      }
      if (t === 1) {
        const a = rng.int(2, 15), b = rng.int(2, 15), c = rng.int(2, 15);
        const sb = rng.chance(0.5) ? 1 : -1, sc = rng.chance(0.5) ? 1 : -1;     // signs of b and c
        const ob = rng.pick(['+', '−']), oc = rng.pick(['+', '−']);
        const shown = `${a} ${ob} ${P(sb * b)} ${oc} ${P(sc * c)}`;
        const eb = (ob === '+' ? 1 : -1) * sb, ec = (oc === '+' ? 1 : -1) * sc;
        const w = (x, y) => `${a} ${x > 0 ? '+' : '−'} ${b} ${y > 0 ? '+' : '−'} ${c}`;
        const good = w(eb, ec);
        return Q(`ra3:simp:${shown}`, `Quelle est l’écriture simplifiée de ${shown} ?`, choice(rng, good, [w(-eb, ec), w(eb, -ec), w(-eb, -ec)]),
          '+ (−n) devient − n, et − (−n) devient + n.',
          `${ob} ${P(sb * b)} s’écrit ${eb > 0 ? '+' : '−'} ${b} et ${oc} ${P(sc * c)} s’écrit ${ec > 0 ? '+' : '−'} ${c} : <b>${good}</b>.`);
      }
      if (t === 2) {
        const s = dec(rng.int(500, 9000), 2), d = add(s, dec(rng.int(100, 6000), 2)), g = dec(rng.int(10, 60) * 100, 2);
        const r = add(sub(s, d), g);
        return Q(`ra3:banque:${s}:${d}:${g}`, `Sur ton compte, il y a ${fmt(s)} €. Tu dépenses ${fmt(d)} €, puis tu reçois ${fmt(g)} €. Quel est le solde de ton compte ?`, num(r, '€'),
          'Une dépense se soustrait, un versement s’ajoute. Le solde peut devenir négatif.',
          `${fmt(s)} − ${fmt(d)} = ${fmt(sub(s, d))}, puis ${fmt(sub(s, d))} + ${fmt(g)} = <b>${fmt(r)}</b> €.`);
      }
      const lo = -dec(rng.int(10, 250), 1), hi = dec(rng.int(10, 350), 1), r = sub(hi, lo);
      return Q(`ra3:ecart:${lo}:${hi}`, `La nuit, il a fait ${fmt(lo)} °C ; l’après-midi, ${fmt(hi)} °C. De combien de degrés la température a-t-elle augmenté ?`, num(r, '°C'),
        'L’écart, c’est la température d’arrivée moins la température de départ.',
        `${fmt(hi)} − ${P(lo)} = ${fmt(hi)} + ${fmt(-lo)} = <b>${fmt(r)}</b> °C.`);
    },
  });

  // ===================== PUISSANCES =====================
  M.notion('puissances', {
    lesson: {
      retenir: `Le <b>carré</b> d’un nombre a, c’est a × a : on le note ${sup('a', 2)} (« a au carré »). Le <b>cube</b> de a, c’est a × a × a : on le note ${sup('a', 3)} (« a au cube »). Le petit nombre en haut, l’<b>exposant</b>, dit combien de fois on multiplie a par lui-même.<br>À connaître : les carrés de 0 à 12 (0, 1, 4, 9, 16, 25, 36, 49, 64, 81, 100, 121, 144) et ${sup(10, 3)} = 1 000.<br>Dans un calcul, on calcule les <b>puissances avant</b> les multiplications, les additions et les soustractions.`,
      explication: `<div class="center">${squareGrid(4)} ${cube3()}</div><p>Un carré de 4 cases sur 4 contient 4 × 4 = ${sup(4, 2)} = <b>16</b> cases : c’est pour ça qu’on dit « au carré ».</p><p>Un cube de 3 petits cubes de côté contient 3 × 3 × 3 = ${sup(3, 3)} = <b>27</b> petits cubes : c’est le « cube » de 3.</p>`,
      methode: [
        `Remplace la puissance par le produit : ${sup(5, 2)} = 5 × 5 ; ${sup(2, 3)} = 2 × 2 × 2.`,
        'Dans une expression, calcule d’abord les parenthèses, puis les puissances, puis les × et ÷, puis les + et −.',
        `Avec une lettre, remplace la lettre par sa valeur : pour ${X} = 3, ${sup(X, 2)} = 3 × 3 = 9.`,
      ],
      exemples: [
        { q: sup(7, 2), r: '7 × 7 = <b>49</b>.' },
        { q: `2 × ${sup(5, 2)}`, r: `La puissance d’abord : 2 × 25 = <b>50</b> (et pas ${sup(10, 2)} = 100).` },
        { q: `Écris 1 000 sous la forme d’un cube`, r: `1 000 = 10 × 10 × 10 = <b>${sup(10, 3)}</b>.` },
      ],
      astuces: [`${sup(10, 2)} = 100 (2 zéros), ${sup(10, 3)} = 1 000 (3 zéros) : l’exposant de 10 donne le nombre de zéros.`],
      erreurs: [
        `${sup(5, 2)} = 10 : FAUX ! ${sup(5, 2)} = 5 × 5 = 25, et pas 5 × 2.`,
        `Confondre ${sup(2, 3)} = 8 et ${sup(3, 2)} = 9.`,
      ],
    },
    generate(level, rng) {
      if (level === 1) {
        const t = rng.int(0, 3);
        if (t === 0) {
          const n = rng.int(0, 12);
          return Q(`pw1:c:${n}`, `${sup(n, 2)} = ?`, num(n * n), `${sup('a', 2)} = a × a (et pas a × 2).`, `${sup(n, 2)} = ${n} × ${n} = <b>${fmt(n * n)}</b>.`);
        }
        if (t === 1) {
          const n = rng.int(3, 9), e = rng.pick([2, 3]);
          const v = n ** e, ds = e === 2 ? [2 * n, n + 2, n * 10 + 2] : [3 * n, n * n, n + 3];
          return Q(`pw1:ch:${n}^${e}`, `${sup(n, e)} = ?`, choice(rng, fmt(v), ds.map(fmt)), 'L’exposant dit combien de fois on écrit le nombre dans le produit.',
            `${sup(n, e)} = ${Array(e).fill(n).join(' × ')} = <b>${fmt(v)}</b>.`);
        }
        if (t === 2) {
          const n = rng.pick([2, 4, 5, 6, 7, 8, 9]), e = rng.pick([2, 3]);
          const good = sup(n, e);
          return Q(`pw1:ecr:${n}^${e}`, `Comment s’écrit ${Array(e).fill(n).join(' × ')} ?`, choice(rng, good, [sup(e, n), `${n} × ${e}`, sup(n, 5 - e)]),
            'On compte combien de fois le nombre est multiplié par lui-même.',
            `Le nombre ${n} est multiplié ${e} fois par lui-même : <b>${good}</b>.`);
        }
        const n = rng.pick([1, 2, 3, 4, 5, 10]);
        return Q(`pw1:cube:${n}`, `${sup(n, 3)} = ?`, num(n ** 3), `${sup('a', 3)} = a × a × a.`, `${sup(n, 3)} = ${n} × ${n} × ${n} = <b>${fmt(n ** 3)}</b>.`);
      }
      if (level === 2) {
        const t = rng.int(0, 3);
        if (t === 0) {
          const n = rng.int(2, 12);
          return Q(`pw2:rac:${n}`, `${fmt(n * n)} est le carré de quel nombre (positif) ?`, num(n), 'Cherche un nombre qui, multiplié par lui-même, donne ce résultat.',
            `${n} × ${n} = ${fmt(n * n)}, donc ${fmt(n * n)} = ${sup(n, 2)} : c’est le carré de <b>${fmt(n)}</b>.`);
        }
        if (t === 1) {
          const n = rng.pick([2, 3, 4, 5, 10]);
          return Q(`pw2:cub:${n}`, `Écris ${fmt(n ** 3)} sous la forme d’un cube : ${fmt(n ** 3)} = ${sup(hole, 3)}`, num(n), 'Essaie 2 × 2 × 2, 3 × 3 × 3…',
            `${n} × ${n} × ${n} = ${fmt(n ** 3)}, donc ${fmt(n ** 3)} = ${sup(n, 3)} : le nombre cherché est <b>${fmt(n)}</b>.`);
        }
        if (t === 2) {
          const a = rng.int(2, 12), b = rng.int(2, 12);
          const kind = rng.int(0, 1);
          if (kind === 0) {
            const r = a * a + b * b;
            return Q(`pw2:s:${a}:${b}`, `${sup(a, 2)} + ${sup(b, 2)} = ?`, num(r), 'Calcule chaque carré, puis additionne.', `${fmt(a * a)} + ${fmt(b * b)} = <b>${fmt(r)}</b>.`);
          }
          const [x, y] = a >= b ? [a, b] : [b, a], r = x * x - y * y;
          return Q(`pw2:d:${x}:${y}`, `${sup(x, 2)} − ${sup(y, 2)} = ?`, num(r), 'Calcule chaque carré, puis soustrais.', `${fmt(x * x)} − ${fmt(y * y)} = <b>${fmt(r)}</b>.`);
        }
        const k = rng.int(2, 9), n = rng.int(2, 10), r = k * n * n;
        return Q(`pw2:k:${k}:${n}`, `${k} × ${sup(n, 2)} = ?`, num(r), 'La puissance se calcule avant la multiplication.', `D’abord ${sup(n, 2)} = ${n * n}, puis ${k} × ${n * n} = <b>${fmt(r)}</b>.`);
      }
      // level 3
      const t = rng.int(0, 3);
      if (t === 0) {
        const k = rng.int(2, 6), n = rng.int(2, 6), paren = rng.chance(0.5), times = rng.chance(0.5), o = times ? '×' : '+';
        const inner = times ? k * n : k + n, r = paren ? inner ** 2 : times ? k * n * n : k + n * n;
        return Q(`pw3:p:${k}:${n}:${paren}:${o}`, `${paren ? `(${k} ${o} ${n})<sup>2</sup>` : `${k} ${o} ${sup(n, 2)}`} = ?`, num(r), 'Attention à l’ordre : parenthèses, puis puissances, puis multiplications et additions.',
          paren ? `D’abord la parenthèse : ${k} ${o} ${n} = ${inner}, puis ${sup(inner, 2)} = ${inner} × ${inner} = <b>${fmt(r)}</b>.` : `D’abord la puissance : ${sup(n, 2)} = ${n * n}, puis ${k} ${o} ${n * n} = <b>${fmt(r)}</b>.`);
      }
      if (t === 1) {
        const f = rng.int(0, 2);
        if (f === 0) {
          const a = rng.int(2, 30), k = rng.int(2, 6), n = rng.int(2, 9), r = a + k * n * n;
          return Q(`pw3:e0:${a}:${k}:${n}`, `${a} + ${k} × ${sup(n, 2)} = ?`, num(r), 'D’abord la puissance, ensuite la multiplication, enfin l’addition.',
            `${a} + ${k} × ${n * n} = ${a} + ${k * n * n} = <b>${fmt(r)}</b>.`);
        }
        if (f === 1) {
          const k = rng.int(2, 9), n = rng.int(2, 10), r = 1000 - k * n * n;
          return Q(`pw3:e1:${k}:${n}`, `${sup(10, 3)} − ${k} × ${sup(n, 2)} = ?`, num(r), 'D’abord les puissances, ensuite la multiplication, enfin la soustraction.',
            `1 000 − ${k} × ${n * n} = 1 000 − ${k * n * n} = <b>${fmt(r)}</b>.`);
        }
        const n = rng.int(3, 5), m = rng.int(2, 11), r = n ** 3 - m * m;
        if (r < 0) {
          const r2 = m * m - n ** 3;
          return Q(`pw3:e2:${m}:${n}`, `${sup(m, 2)} − ${sup(n, 3)} = ?`, num(r2), 'Calcule le carré et le cube, puis soustrais.', `${m * m} − ${n ** 3} = <b>${fmt(r2)}</b>.`);
        }
        return Q(`pw3:e2:${n}:${m}`, `${sup(n, 3)} − ${sup(m, 2)} = ?`, num(r), 'Calcule le cube et le carré, puis soustrais.', `${n ** 3} − ${m * m} = <b>${fmt(r)}</b>.`);
      }
      if (t === 2) {
        const x = rng.int(2, 6), f = rng.int(0, 2);
        if (f === 0) {
          const k = rng.int(2, 5), c = rng.int(1, 20), r = k * x * x + c;
          return Q(`pw3:l0:${k}:${c}:${x}`, `Calcule ${k}${sup(X, 2)} + ${c} pour ${X} = ${x}.`, num(r), `${k}${sup(X, 2)} veut dire ${k} × ${X} × ${X}.`,
            `${k} × ${sup(x, 2)} + ${c} = ${k} × ${x * x} + ${c} = ${k * x * x} + ${c} = <b>${fmt(r)}</b>.`);
        }
        if (f === 1) {
          const r = x * x + x;
          return Q(`pw3:l1:${x}`, `Calcule ${sup(X, 2)} + ${X} pour ${X} = ${x}.`, num(r), `Remplace chaque ${X} par sa valeur.`, `${sup(x, 2)} + ${x} = ${x * x} + ${x} = <b>${fmt(r)}</b>.`);
        }
        const c = rng.int(1, x ** 3 - 1), r = x ** 3 - c;
        return Q(`pw3:l2:${x}:${c}`, `Calcule ${sup(X, 3)} − ${c} pour ${X} = ${x}.`, num(r), `${sup(X, 3)} veut dire ${X} × ${X} × ${X}.`, `${sup(x, 3)} − ${c} = ${x ** 3} − ${c} = <b>${fmt(r)}</b>.`);
      }
      const s = rng.chance(0.5) ? dec(rng.int(1, 9), 1) : dec(rng.int(11, 25), 1), r = mul(s, s);
      return Q(`pw3:dec:${s}`, `Un carré a pour côté ${fmt(s)} cm. Calcule son aire, c’est-à-dire ${sup(fmt(s), 2)}.`, num(r, 'cm²'), 'Multiplie le nombre par lui-même, sans oublier la virgule.',
        `${sup(fmt(s), 2)} = ${fmt(s)} × ${fmt(s)} = <b>${fmt(r)}</b> cm².`);
    },
  });

  // ===================== CALCUL LITTÉRAL =====================
  const FORMULAS = [
    { q: `Le double d’un nombre ${X}`, good: `2${X}`, bad: [sup(X, 2), `${X} + 2`, `${X} ÷ 2`] },
    { q: `Le triple d’un nombre ${X}`, good: `3${X}`, bad: [sup(X, 3), `${X} + 3`, `3 + ${X} + 3`] },
    { q: `Le carré d’un nombre ${X}`, good: sup(X, 2), bad: [`2${X}`, `${X} + 2`, `${X} + ${X}`] },
    { q: `Le successeur d’un nombre entier ${it('n')}`, good: `${it('n')} + 1`, bad: [`${it('n')} − 1`, `2${it('n')}`, `${it('n')} + 2`] },
    { q: `Le prédécesseur d’un nombre entier ${it('n')}`, good: `${it('n')} − 1`, bad: [`${it('n')} + 1`, `1 − ${it('n')}`, `${it('n')} ÷ 2`] },
    { q: `Le périmètre d’un carré de côté ${it('c')}`, good: `4${it('c')}`, bad: [sup(it('c'), 2), `${it('c')} + 4`, sup(it('c'), 4)] },
    { q: `L’aire d’un carré de côté ${it('c')}`, good: sup(it('c'), 2), bad: [`4${it('c')}`, `2${it('c')}`, `${it('c')} + ${it('c')}`] },
    { q: `Le périmètre d’un rectangle de longueur ${it('L')} et de largeur ${it('ℓ')}`, good: `2 × (${it('L')} + ${it('ℓ')})`, bad: [`${it('L')} × ${it('ℓ')}`, `${it('L')} + ${it('ℓ')}`, `2${it('L')} + ${it('ℓ')}`] },
    { q: `L’aire d’un rectangle de longueur ${it('L')} et de largeur ${it('ℓ')}`, good: `${it('L')} × ${it('ℓ')}`, bad: [`2 × (${it('L')} + ${it('ℓ')})`, `${it('L')} + ${it('ℓ')}`, `${sup(it('L'), 2)}`] },
    { q: `Le triple d’un nombre ${X}, augmenté de 5`, good: `3${X} + 5`, bad: [`3(${X} + 5)`, `${sup(X, 3)} + 5`, `${X} + 3 + 5`] },
    { q: `Le double de la somme d’un nombre ${X} et de 4`, good: `2(${X} + 4)`, bad: [`2${X} + 4`, `${sup(X, 2)} + 4`, `${X} + 2 + 4`] },
  ];
  const SP = ['une somme', 'un produit'];

  M.notion('calcul-litteral', {
    lesson: {
      retenir: `Une <b>expression littérale</b> contient des lettres qui représentent des nombres. Conventions : 3${X} veut dire 3 × ${X} ; ${sup(X, 2)} = ${X} × ${X} ; 5(${X} + 2) = 5 × (${X} + 2).<br>Pour <b>calculer</b> une expression, on <b>remplace</b> la lettre par sa valeur (on remet alors les signes ×).<br>Une expression est une <b>somme</b> ou un <b>produit</b> selon la <b>dernière opération</b> à effectuer : 3${X} + 2 est une somme, 5(${X} + 4) est un produit.<br><b>Développer</b> : k(a + b) = ka + kb. <b>Factoriser</b> : ka + kb = k(a + b).<br><b>Réduire</b> : on regroupe les termes en ${X} entre eux et les nombres entre eux : 3${X} + 5 + 2${X} − 1 = 5${X} + 4.`,
      explication: `${letterArea(4, 3)}<p>Ce rectangle a pour largeur 4 et pour longueur ${X} + 3. Son aire est 4(${X} + 3).</p><p>Mais c’est aussi l’aire des deux morceaux : 4 × ${X} + 4 × 3 = 4${X} + 12. Donc <b>4(${X} + 3) = 4${X} + 12</b>, quelle que soit la valeur de ${X} : c’est développer.</p>`,
      methode: [
        `Pour calculer 3${X} + 2 pour ${X} = 4 : réécris le signe × : 3 × 4 + 2, puis applique les priorités : 12 + 2 = 14.`,
        'Pour tester une égalité pour une valeur : calcule séparément chaque membre ; l’égalité est vraie si on obtient le même nombre.',
        `Pour développer k(a + b) : multiplie k par <b>chaque</b> terme de la parenthèse.`,
        `Pour réduire : additionne les nombres devant ${X} (3${X} + 2${X} = 5${X}), puis les nombres seuls.`,
      ],
      exemples: [
        { q: `Calcule 5${X} − 3 pour ${X} = 2`, r: '5 × 2 − 3 = 10 − 3 = <b>7</b>.' },
        { q: `Développe 3(${X} + 4)`, r: `3 × ${X} + 3 × 4 = <b>3${X} + 12</b>.` },
        { q: `Réduis 7${X} + 2 − 4${X} + 6`, r: `7${X} − 4${X} = 3${X} et 2 + 6 = 8 : <b>3${X} + 8</b>.` },
      ],
      astuces: [`On ne peut pas regrouper 3${X} et 5 : ce ne sont pas des termes de même nature (comme 3 pommes et 5 euros).`],
      erreurs: [
        `Pour ${X} = 4, 3${X} ne vaut pas 34 : c’est 3 × 4 = 12.`,
        `3(${X} + 4) = 3${X} + 4 : FAUX, le 3 multiplie aussi le 4 → 3${X} + 12.`,
        `3${X} + 5 = 8${X} : FAUX, on ne mélange pas les ${X} et les nombres seuls.`,
      ],
    },
    generate(level, rng) {
      if (level === 1) {
        const t = rng.int(0, 3);
        if (t === 0) {
          const a = rng.int(2, 9), b = nz(rng, -12, 20), x = rng.int(1, 10), r = a * x + b;
          return Q(`cl1:sub:${a}:${b}:${x}`, `Calcule ${lin(a, b)} pour ${X} = ${x}.`, num(r), `${a}${X} veut dire ${a} × ${X}.`,
            `${subst(a, b, x)} = ${fmt(a * x)}${b > 0 ? ` + ${fmt(b)}` : ` − ${fmt(-b)}`} = <b>${fmt(r)}</b>.`);
        }
        if (t === 1) {
          if (rng.chance(0.5)) {
            const k = rng.int(2, 9);
            return Q(`cl1:conv:${k}`, `Que signifie ${k}${X} ?`, choice(rng, `${k} × ${X}`, [`${k} + ${X}`, sup(X, k), `${k}0 + ${X}`]), 'Entre un nombre et une lettre, on n’écrit pas le signe de l’opération.',
              `${k}${X} est l’écriture simplifiée de <b>${k} × ${X}</b>.`);
          }
          const e = rng.pick([2, 3]);
          return Q(`cl1:convp:${e}`, `Que signifie ${sup(X, e)} ?`, choice(rng, Array(e).fill(X).join(' × '), [`${e} × ${X}`, `${X} + ${e}`, Array(5 - e).fill(X).join(' × ')]), 'L’exposant dit combien de fois on multiplie la lettre par elle-même.',
            `${sup(X, e)} = <b>${Array(e).fill(X).join(' × ')}</b>.`);
        }
        if (t === 2) {
          const i = rng.int(0, FORMULAS.length - 1), f = FORMULAS[i];
          return Q(`cl1:form:${i}`, `${f.q} s’écrit :`, choice(rng, f.good, f.bad), 'Traduis chaque mot par une opération : double → × 2, carré → × lui-même, successeur → + 1…',
            `${f.q} s’écrit <b>${f.good}</b>.`);
        }
        const a = rng.int(2, 9), b = rng.int(1, 9);
        const ex = rng.pick([
          [`${lin(a, b)}`, SP[0]], [`${a}(${lin(1, b)})`, SP[1]], [`${a} × ${X}`, SP[1]], [`${X} + ${b}`, SP[0]], [`${a}${X}`, SP[1]], [`${a} + ${b}${X}`, SP[0]],
        ]);
        return Q(`cl1:sp:${ex[0]}`, `L’expression ${ex[0]} est :`, fixedChoice(SP, ex[1]), 'Cherche la dernière opération qu’on ferait si on remplaçait la lettre par un nombre.',
          `La dernière opération à effectuer est ${ex[1] === SP[0] ? 'une addition' : 'une multiplication'} : c’est <b>${ex[1]}</b>.`);
      }
      if (level === 2) {
        const t = rng.int(0, 4);
        if (t === 0) {
          const a = rng.int(2, 9), c = rng.int(1, 9), b = rng.int(1, 12), d = nz(rng, -12, 12);
          const good = lin(a + c, b + d);
          return Q(`cl2:red:${a}:${b}:${c}:${d}`, `Réduis : ${terms([[a, X], [b, ''], [c, X], [d, '']])}`, choice(rng, good, [lin(a + c, b - d), lin(a * c, b + d), lin(a + c + b + d, 0), lin(a + c + 1, b + d - 1)]),
            `Regroupe les termes en ${X} ensemble et les nombres seuls ensemble.`,
            `${coef(a)} + ${coef(c)} = ${coef(a + c)} et ${fmt(b)} ${d > 0 ? '+' : '−'} ${fmt(abs(d))} = ${fmt(b + d)} : <b>${good}</b>.`);
        }
        if (t === 1) {
          const k = rng.int(2, 9), b = rng.int(1, 9), minus = rng.chance(0.4), s = minus ? -1 : 1;
          const good = lin(k, s * k * b);
          return Q(`cl2:dev:${k}:${s * b}`, `Développe : ${k}(${lin(1, s * b)})`, choice(rng, good, [lin(k, s * b), lin(1, s * k * b), lin(k, -s * k * b), lin(k + k * b, 0)]),
            'Le nombre devant la parenthèse multiplie chaque terme de la parenthèse.',
            `${k} × ${X} ${minus ? '−' : '+'} ${k} × ${b} = <b>${good}</b>.`);
        }
        if (t === 2) {
          const x = rng.int(1, 6), a = rng.int(2, 6), c = rng.int(2, 9), b = rng.int(1, 10);
          const trueD = a * x + b - c * x, isTrue = rng.chance(0.5), d = isTrue ? trueD : trueD + nz(rng, -3, 3);
          const L = a * x + b, Rv = c * x + d;
          return Q(`cl2:test:${a}:${b}:${c}:${d}:${x}`, `L’égalité ${lin(a, b)} = ${lin(c, d)} est-elle vraie pour ${X} = ${x} ?`, fixedChoice(['Vraie', 'Fausse'], L === Rv ? 'Vraie' : 'Fausse'),
            'Calcule chaque membre séparément, puis compare.',
            `Membre de gauche : ${subst(a, b, x)} = ${fmt(L)}. Membre de droite : ${d === 0 ? `${c} × ${x}` : subst(c, d, x)} = ${fmt(Rv)}. ${L === Rv ? 'Même résultat : l’égalité est <b>vraie</b>.' : `${fmt(L)} ≠ ${fmt(Rv)} : l’égalité est <b>fausse</b>.`}`);
        }
        if (t === 3) {
          const a = rng.int(2, 9), b = rng.int(1, 9), c = rng.int(2, 9);
          const ex = rng.pick([
            [`${c} + ${a}(${lin(1, b)})`, SP[0], 'une addition (on fait la multiplication avant)'],
            [`(${lin(1, b)}) × ${a}`, SP[1], 'une multiplication (la parenthèse se calcule avant)'],
            [`${X}(${lin(1, b)})`, SP[1], 'une multiplication'],
            [`${a} × ${X} + ${b}`, SP[0], 'une addition (la multiplication est prioritaire)'],
            [`${sup(X, 2)} + ${b}`, SP[0], 'une addition (le carré se calcule avant)'],
            [`${a}(${X} + ${b}${X})`, SP[1], 'une multiplication'],
          ]);
          return Q(`cl2:sp:${ex[0]}`, `L’expression ${ex[0]} est :`, fixedChoice(SP, ex[1]), 'Pense aux priorités : quelle opération ferais-tu en dernier ?',
            `La dernière opération à effectuer est ${ex[2]} : c’est <b>${ex[1]}</b>.`);
        }
        const a = rng.int(2, 9), b = rng.int(2, 9), u = rng.int(1, 10), v = rng.int(1, 10), r = a * u + b * v;
        return Q(`cl2:sub2:${a}:${b}:${u}:${v}`, `Calcule ${a}${it('a')} + ${b}${it('b')} pour ${it('a')} = ${u} et ${it('b')} = ${v}.`, num(r), 'Remplace chaque lettre par sa valeur, en remettant les signes ×.',
          `${a} × ${u} + ${b} × ${v} = ${a * u} + ${b * v} = <b>${fmt(r)}</b>.`);
      }
      // level 3
      const t = rng.int(0, 3);
      if (t === 0) {
        let a, b; do { a = rng.int(1, 6); b = rng.int(1, 9); } while (gcd(a, b) !== 1);
        const k = rng.int(2, 9), minus = rng.chance(0.4), s = minus ? -1 : 1;
        const shown = lin(k * a, s * k * b), good = `${k}(${lin(a, s * b)})`;
        return Q(`cl3:fact:${k}:${a}:${s * b}`, `Factorise : ${shown}`, choice(rng, good, [`${k}(${lin(k * a, s * b)})`, `${k}(${lin(a, s * k * b)})`, `${k * a}(${lin(1, s * k * b)})`]),
          'Cherche le plus grand nombre qui divise les deux termes, puis vérifie en développant.',
          `${coef(k * a)} = ${k} × ${coef(a)} et ${fmt(k * b)} = ${k} × ${b}, donc ${shown} = <b>${good}</b>. On vérifie en développant.`);
      }
      if (t === 1) {
        const a = dec(rng.int(15, 60), 1), c = -dec(rng.int(1, 14), 1), b = dec(rng.int(1, 80), 1), d = nz(rng, -50, 50) / 10;
        const A = add(a, c), B = add(b, d), good = lin(A, B);
        return Q(`cl3:red:${a}:${b}:${c}:${d}`, `Réduis : ${terms([[a, X], [b, ''], [c, X], [d, '']])}`, choice(rng, good, [lin(sub(a, c), B), lin(A, sub(b, d)), lin(add(A, B), 0), lin(sub(a, c), sub(b, d))]),
          `Regroupe les termes en ${X} ensemble et les nombres seuls ensemble, en faisant attention aux signes.`,
          `${fmt(a)} − ${fmt(-c)} = ${fmt(A)} et ${fmt(b)} ${d > 0 ? '+' : '−'} ${fmt(abs(d))} = ${fmt(B)} : <b>${good}</b>.`);
      }
      if (t === 2) {
        const x = rng.int(1, 6), f = rng.int(0, 1);
        if (f === 0) {
          const k = rng.int(x + 1, 9), r = x * x - k * x;
          return Q(`cl3:subn:${k}:${x}`, `Calcule ${sup(X, 2)} − ${k}${X} pour ${X} = ${x}.`, num(r), 'Remplace la lettre, puis respecte les priorités. Le résultat peut être négatif.',
            `${sup(x, 2)} − ${k} × ${x} = ${x * x} − ${k * x} = <b>${fmt(r)}</b>.`);
        }
        const c = rng.int(1, 9), k = rng.int(2, 6), r = c - k * x;
        return Q(`cl3:subm:${c}:${k}:${x}`, `Calcule ${c} − ${k}${X} pour ${X} = ${x}.`, num(r), 'La multiplication est prioritaire. Le résultat peut être négatif.',
          `${c} − ${k} × ${x} = ${c} − ${k * x} = <b>${fmt(r)}</b>.`);
      }
      const k = rng.int(2, 6), b = rng.int(1, 6), c = rng.int(1, 9);
      const good = lin(k + c, k * b);
      return Q(`cl3:devred:${k}:${b}:${c}`, `Développe puis réduis : ${k}(${lin(1, b)}) + ${coef(c)}`, choice(rng, good, [lin(k + c, b), lin(k * c, k * b), lin(k + c + k * b, 0), lin(k, k * b + c)]),
        'Développe d’abord la parenthèse, puis regroupe les termes en x.',
        `${k}(${lin(1, b)}) + ${coef(c)} = ${lin(k, k * b)} + ${coef(c)} = <b>${good}</b>.`);
    },
  });

  // ===================== ÉQUATIONS =====================
  const yesNo = ['Oui', 'Non'];
  M.notion('equations', {
    lesson: {
      retenir: `Dans une <b>équation</b>, la lettre (souvent ${X}) est l’<b>inconnue</b> : un nombre qu’on cherche. <b>Résoudre</b> l’équation, c’est trouver la valeur de ${X} qui rend l’égalité vraie : c’est la <b>solution</b>.<br>On utilise l’<b>opération inverse</b> :<br>• ${X} + b = c donne ${X} = c − b ;<br>• a${X} = c donne ${X} = c ÷ a.<br>Pour <b>vérifier</b> qu’un nombre est solution, on le met à la place de ${X} et on regarde si l’égalité est vraie.`,
      explication: `${balance(3, 8)}<p>La balance est en équilibre : ${X} + 3 = 8. Si on enlève 3 poids de chaque côté, elle reste en équilibre : il reste ${X} = 8 − 3 = <b>5</b>.</p><p>Défaire « + 3 », c’est faire « − 3 » : on utilise l’opération inverse.</p>`,
      methode: [
        `Repère l’opération appliquée à ${X} (+ b ou × a).`,
        'Fais l’opération inverse sur l’autre membre : − b pour défaire + b, ÷ a pour défaire × a (et + b pour défaire − b).',
        `Vérifie en remplaçant ${X} par ta solution dans l’équation de départ.`,
      ],
      exemples: [
        { q: `${X} + 7 = 3`, r: `${X} = 3 − 7 = <b>−4</b>. Vérification : −4 + 7 = 3.` },
        { q: `5${X} = 12`, r: `${X} = 12 ÷ 5 = <b>2,4</b>. Vérification : 5 × 2,4 = 12.` },
        { q: `Je pense à un nombre ; je le multiplie par 3 et j’obtiens 7. Quel est ce nombre ?`, r: `3${X} = 7, donc ${X} = 7 ÷ 3 = <b>${frac(7, 3)}</b> (le quotient de 7 par 3).` },
      ],
      astuces: ['C’est une opération à trou : 2 + … = 7 se complète par 7 − 2, et 3 × … = 12 par 12 ÷ 3.'],
      erreurs: [
        `${X} + 7 = 3 donne ${X} = 3 + 7 : FAUX, on défait + 7 avec − 7.`,
        `5${X} = 12 donne ${X} = 12 − 5 : FAUX, 5${X} veut dire 5 × ${X}, on divise.`,
      ],
    },
    generate(level, rng) {
      const solveAdd = (b, c) => {   // x + b = c (b ≠ 0)
        const x = sub(c, b);
        return {
          eq: b > 0 ? `${X} + ${fmt(b)} = ${fmt(c)}` : `${X} − ${fmt(-b)} = ${fmt(c)}`,
          x,
          corr: b > 0
            ? `On défait « + ${fmt(b)} » : ${X} = ${fmt(c)} − ${fmt(b)} = <b>${fmt(x)}</b>. Vérification : ${fmt(x)} + ${fmt(b)} = ${fmt(c)}.`
            : `On défait « − ${fmt(-b)} » : ${X} = ${fmt(c)} + ${fmt(-b)} = <b>${fmt(x)}</b>. Vérification : ${fmt(x)} − ${fmt(-b)} = ${fmt(c)}.`,
        };
      };
      const solveMul = (a, c) => {   // ax = c, exact decimal quotient
        const x = div(c, a);
        return { eq: `${coef(a)} = ${fmt(c)}`, x, corr: `On défait « × ${fmt(a)} » : ${X} = ${fmt(c)} ÷ ${fmt(a)} = <b>${fmt(x)}</b>. Vérification : ${fmt(a)} × ${fmt(x)} = ${fmt(c)}.` };
      };
      const hAdd = 'Quelle opération défait une addition (ou une soustraction) ?', hMul = `${X} est multiplié par un nombre : quelle opération défait une multiplication ?`;
      if (level === 1) {
        const t = rng.int(0, 3);
        if (t === 0) {
          const b = rng.int(2, 30), c = b + rng.int(1, 40), s = solveAdd(b, c);
          return Q(`eq1:add:${b}:${c}`, `Résous l’équation : ${s.eq}`, num(s.x), hAdd, s.corr);
        }
        if (t === 1) {
          const a = rng.int(2, 10), c = a * rng.int(2, 12), s = solveMul(a, c);
          return Q(`eq1:mul:${a}:${c}`, `Résous l’équation : ${s.eq}`, num(s.x), hMul, s.corr);
        }
        if (t === 2) {
          const a = rng.int(2, 9), x = rng.int(2, 10), c = a * x, n = rng.chance(0.5) ? x : x + nz(rng, -2, 2);
          const add_ = rng.chance(0.5), cc = add_ ? x + a : c, eq = add_ ? `${X} + ${a} = ${cc}` : `${a}${X} = ${cc}`;
          const val = add_ ? n + a : a * n, ok = val === cc;
          return Q(`eq1:test:${eq}:${n}`, `Le nombre ${fmt(n)} est-il solution de l’équation ${eq} ?`, fixedChoice(yesNo, ok ? 'Oui' : 'Non'), `Remplace ${X} par ${fmt(n)} et calcule.`,
            `${add_ ? `${fmt(n)} + ${a}` : `${a} × ${fmt(n)}`} = ${fmt(val)}${ok ? ` : on trouve bien ${cc}, donc <b>oui</b>.` : `, et pas ${cc} : <b>non</b>.`}`);
        }
        const b = rng.int(3, 20), c = b + rng.int(3, 30), mulCase = rng.chance(0.5);
        if (mulCase) {
          const a = rng.int(2, 9), cc = a * rng.int(2, 12), good = `${a}${X} = ${cc}`;
          return Q(`eq1:mod:m:${a}:${cc}`, `Je pense à un nombre ${X}. Je le multiplie par ${a} et j’obtiens ${cc}. Quelle équation traduit cette phrase ?`, choice(rng, good, [`${X} + ${a} = ${cc}`, `${cc}${X} = ${a}`, `${X} = ${a} × ${cc}`]),
            'Traduis la phrase mot à mot, dans l’ordre.', `« Je le multiplie par ${a} » : ${a} × ${X}, soit ${a}${X}. L’équation est <b>${good}</b>.`);
        }
        const good = `${X} + ${b} = ${c}`;
        return Q(`eq1:mod:a:${b}:${c}`, `Je pense à un nombre ${X}. Je lui ajoute ${b} et j’obtiens ${c}. Quelle équation traduit cette phrase ?`, choice(rng, good, [`${b}${X} = ${c}`, `${X} + ${c} = ${b}`, `${X} = ${b} + ${c}`]),
          'Traduis la phrase mot à mot, dans l’ordre.', `« Je lui ajoute ${b} » : ${X} + ${b}. L’équation est <b>${good}</b>.`);
      }
      if (level === 2) {
        const t = rng.int(0, 3);
        if (t === 0) {
          const minus = rng.chance(0.4);
          const b = minus ? -rng.int(2, 20) : rng.int(2, 20), c = minus ? nz(rng, -15, 30) : rng.int(-10, b - 1), s = solveAdd(b, c);
          return Q(`eq2:add:${b}:${c}`, `Résous l’équation : ${s.eq}`, num(s.x), hAdd, s.corr);
        }
        if (t === 1) {
          const a = rng.pick([2, 4, 5, 8, 10]);
          let c; do c = rng.int(a + 1, 99); while (c % a === 0);
          const s = solveMul(a, c);
          return Q(`eq2:mul:${a}:${c}`, `Résous l’équation : ${s.eq}`, num(s.x), hMul, s.corr);
        }
        if (t === 2) {
          const b = nz(rng, -99, 99) / 10, c = nz(rng, -99, 99) / 10;
          const s = solveAdd(b, c);
          return Q(`eq2:dec:${b}:${c}`, `Résous l’équation : ${s.eq}`, num(s.x), hAdd, s.corr);
        }
        if (rng.chance(0.5)) {
          const up = rng.int(3, 12), now = rng.int(-6, up - 1), x = now - up;
          return Q(`eq2:temp:${up}:${now}`, `La température a augmenté de ${up} °C et il fait maintenant ${fmt(now)} °C. On note ${X} la température de départ : ${X} + ${up} = ${fmt(now)}. Quelle était la température de départ ?`, num(x, '°C'), hAdd,
            `${X} = ${fmt(now)} − ${up} = <b>${fmt(x)}</b> °C. Vérification : ${fmt(x)} + ${up} = ${fmt(now)}.`);
        }
        const a = rng.int(3, 8), p = dec(rng.int(5, 60) * 5, 2), c = mul(a, p);
        return Q(`eq2:prix:${a}:${p}`, `Un paquet de ${a} stylos identiques coûte ${fmt(c)} €. On note ${it('p')} le prix d’un stylo : ${a}${it('p')} = ${fmt(c)}. Combien coûte un stylo ?`, num(p, '€'), hMul,
          `${it('p')} = ${fmt(c)} ÷ ${a} = <b>${fmt(p)}</b> €. Vérification : ${a} × ${fmt(p)} = ${fmt(c)}.`);
      }
      // level 3
      const t = rng.int(0, 3);
      if (t === 0) {
        const a = rng.pick([3, 6, 7, 9, 11, 12]);
        let c; do c = rng.int(1, 60); while (gcd(a, c) !== 1);
        return Q(`eq3:frac:${a}:${c}`, `Résous l’équation : ${a}${X} = ${c} (donne la solution sous forme de fraction)`, { kind: 'fraction', n: c, d: a },
          `${X} est le nombre qui, multiplié par ${a}, donne ${c} : c’est un quotient.`,
          `${X} = ${c} ÷ ${a} = <b>${frac(c, a)}</b>. Vérification : ${a} × ${frac(c, a)} = ${c}.`);
      }
      if (t === 1) {
        const a = rng.pick([0.2, 0.4, 0.5, 1.2, 1.5, 2.5, 0.25]), x = rng.int(2, 24), c = mul(a, x), s = solveMul(a, c);
        return Q(`eq3:mul:${a}:${c}`, `Résous l’équation : ${s.eq}`, num(s.x), hMul, s.corr);
      }
      if (t === 2) {
        const add_ = rng.chance(0.5);
        if (add_) {
          const b = rng.int(2, 15), x = -rng.int(1, 15), c = x + b, n = rng.chance(0.5) ? x : rng.pick([-x, x + nz(rng, -2, 2)]);
          const ok = n + b === c;
          return Q(`eq3:test:a:${b}:${c}:${n}`, `Le nombre ${fmt(n)} est-il solution de l’équation ${X} + ${b} = ${fmt(c)} ?`, fixedChoice(yesNo, ok ? 'Oui' : 'Non'), `Remplace ${X} par ${fmt(n)} et calcule.`,
            `${fmt(n)} + ${b} = ${fmt(n + b)}${ok ? ` : c’est bien ${fmt(c)}, donc <b>oui</b>.` : `, et pas ${fmt(c)} : <b>non</b>.`}`);
        }
        const a = rng.int(2, 6), b = rng.int(1, 9), x = rng.int(1, 8), c = a * x + b, n = rng.chance(0.5) ? x : x > 1 && rng.chance(0.4) ? x - 1 : x + rng.int(1, 2);
        const ok = a * n + b === c;
        return Q(`eq3:test:m:${a}:${b}:${c}:${n}`, `Le nombre ${fmt(n)} est-il solution de l’équation ${lin(a, b)} = ${c} ?`, fixedChoice(yesNo, ok ? 'Oui' : 'Non'), `Remplace ${X} par ${fmt(n)}, en remettant le signe ×.`,
          `${a} × ${fmt(n)} + ${b} = ${fmt(a * n + b)}${ok ? ` : c’est bien ${c}, donc <b>oui</b>.` : `, et pas ${c} : <b>non</b>.`}`);
      }
      if (rng.chance(0.5)) {
        const L = rng.int(4, 12), w = dec(rng.int(11, 79), 1), A = mul(L, w), l = it('ℓ');
        const good = `${L}${l} = ${fmt(A)}`;
        return Q(`eq3:mod:${L}:${w}`, `Un rectangle a pour longueur ${L} cm et pour aire ${fmt(A)} cm². On note ${l} sa largeur (en cm). Quelle équation permet de trouver ${l} ?`,
          choice(rng, good, [`${l} + ${L} = ${fmt(A)}`, `2 × (${l} + ${L}) = ${fmt(A)}`, `${l} = ${L} × ${fmt(A)}`]),
          'L’aire d’un rectangle, c’est longueur × largeur.',
          `Aire = longueur × largeur, donc <b>${good}</b>. On trouve ${l} = ${fmt(A)} ÷ ${L} = ${fmt(w)} cm.`);
      }
      const spent = dec(rng.int(150, 2500), 2), left = dec(rng.int(20, 2000), 2), x = add(spent, left);
      return Q(`eq3:arg:${spent}:${left}`, `Après avoir dépensé ${fmt(spent)} €, il te reste ${fmt(left)} €. On note ${X} la somme de départ : ${X} − ${fmt(spent)} = ${fmt(left)}. Quelle était la somme de départ ?`, num(x, '€'), hAdd,
        `On défait « − ${fmt(spent)} » : ${X} = ${fmt(left)} + ${fmt(spent)} = <b>${fmt(x)}</b> €.`);
    },
  });

  // ===================== EXPLICATIONS =====================
  const B = M.cat.BASE, E = M.explain;
  E('relatifs-reperage', [
    ['dessin', B],
    ['vie', `<div class="center">${thermo(-4)}</div><p>Un thermomètre est une droite graduée verticale. Sous le 0, les températures sont <b>négatives</b> : −4 °C, c’est « 4 degrés sous zéro ». Plus on descend, plus il fait froid : −8 °C est plus froid que −4 °C, donc <b>−8 &lt; −4</b>.</p>`],
    ['etapes', '<p>Pour comparer −3,5 et −3,25 :</p><ol><li>Ils sont tous les deux négatifs.</li><li>Je compare leurs distances à zéro : 3,50 et 3,25. La plus grande est 3,50.</li><li>Le plus loin de 0 est le plus petit : <b>−3,5 &lt; −3,25</b>.</li></ol>'],
    ['lien', '<p>Les nombres que tu connais (0 ; 1 ; 2,5…) sont les nombres positifs. On en ajoute de l’autre côté de 0, comme dans un miroir : −1 ; −2,5… Chaque nombre a son <b>opposé</b> de l’autre côté (3 et −3), à la même distance de 0 : cette distance, c’est la <b>valeur absolue</b>.</p>'],
  ]);
  E('relatifs-addition', [
    ['dessin', B],
    ['vie', '<p>Pense à un <b>ascenseur</b> : le rez-de-chaussée est le niveau 0 et les sous-sols sont −1, −2, −3. Tu es au niveau −2 et tu montes de 5 étages : −2 + 5 = 3. Tu redescends de 7 étages : 3 − 7 = <b>−4</b>, tu es au 4<sup>e</sup> sous-sol.</p><p>Avec l’argent : une dette de 3 € plus une dette de 5 €, c’est une dette de 8 € : −3 + (−5) = −8.</p>'],
    ['etapes', '<p>Pour calculer 4 − (−6) + (−9) :</p><ol><li>Je simplifie : − (−6) devient + 6, et + (−9) devient − 9. J’obtiens 4 + 6 − 9.</li><li>Je regroupe les positifs : 4 + 6 = 10. Les négatifs : −9.</li><li>10 et −9 sont de signes contraires : 10 − 9 = 1, et 10 est plus loin de 0. Résultat : <b>1</b>.</li></ol>'],
  ]);
  E('puissances', [
    ['dessin', B],
    ['lien', `<p>Tu connais déjà l’aire d’un carré : côté × côté. Un carré de côté 5 cm a une aire de 5 × 5 = 25 cm², qu’on écrit ${sup(5, 2)}. C’est pour ça que l’unité d’aire s’écrit cm² ! De même, le volume d’un cube d’arête 5 cm est 5 × 5 × 5 = ${sup(5, 3)} = 125 cm³.</p>`],
    ['vie', `<p>Un cube de 10 cm de côté se remplit avec 10 × 10 × 10 = ${sup(10, 3)} = <b>1 000</b> petits cubes de 1 cm de côté. Ce cube de 10 cm de côté contient exactement <b>1 litre</b> : 1 L = 1 000 cm³.</p>`],
  ]);
  E('calcul-litteral', [
    ['dessin', B],
    ['vie', `<p>Au cinéma, une place coûte 8 € et on paie 3 € de frais de réservation. Pour ${it('n')} places, on paie <b>8${it('n')} + 3</b> euros. La formule marche pour tous les nombres de places : pour 4 places, 8 × 4 + 3 = 35 €. La lettre remplace « n’importe quel nombre ».</p>`],
    ['etapes', `<p>Pour réduire 3${X} + 5 + 2${X} − 1 :</p><ol><li>Je souligne les termes en ${X} : 3${X} et 2${X}. Je les ajoute : 5${X}.</li><li>Je regroupe les nombres seuls : 5 − 1 = 4.</li><li>J’écris le résultat : <b>5${X} + 4</b>. Je ne peux pas aller plus loin : 5${X} et 4 ne sont pas de même nature.</li></ol>`],
  ]);
  E('equations', [
    ['dessin', B],
    ['etapes', `<p>Pour résoudre 4${X} = 18 :</p><ol><li>Je lis : « 4 fois ${X} égale 18 ».</li><li>L’opération inverse de « × 4 » est « ÷ 4 » : ${X} = 18 ÷ 4 = 4,5.</li><li>Je vérifie : 4 × 4,5 = 18. La solution est <b>4,5</b>.</li></ol>`],
    ['lien', `<p>Tu sais déjà compléter des opérations à trou : 9 + … = 15 se complète par 15 − 9 = 6. Une équation, c’est la même chose, avec une lettre à la place des pointillés : ${X} + 9 = 15, donc ${X} = 6. Le mathématicien Al-Khwarizmi appelait cette inconnue « la chose ».</p>`],
  ]);
})();
