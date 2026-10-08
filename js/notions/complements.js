// Extra lessons beyond 6e/5e: identités remarquables (3e) and other divisibility rules (6, 8, 11, 25).
(function () {
  'use strict';
  const M = globalThis.M;
  const { fmt } = M.u;
  const { Q, num, choice, fixedChoice } = M.kit;
  const { svg, text, line } = M.svg.raw;

  // ===================== IDENTITÉS REMARQUABLES =====================
  // Polynomial c2·x² + c1·x + c0 written the French way: "4x² − 12x + 9".
  function poly(c2, c1, c0) {
    const parts = [];
    const term = (c, v) => (v ? `${Math.abs(c) === 1 ? '' : fmt(Math.abs(c))}${v}` : fmt(Math.abs(c)));
    [[c2, '<i>x</i>²'], [c1, '<i>x</i>'], [c0, '']].forEach(([c, v]) => {
      if (!c) return;
      parts.push(parts.length ? `${c < 0 ? '−' : '+'} ${term(c, v)}` : `${c < 0 ? '−' : ''}${term(c, v)}`);
    });
    return parts.join(' ');
  }
  const lin = (a, b, sign = '+') => `${a === 1 ? '' : a}<i>x</i> ${sign} ${b}`;   // "3x + 2"
  const sq = s => `(${s})²`;

  // The square (a + b)² cut into a², ab, ab, b².
  const squareFig = (() => {
    const o = 20, A = 110, Bw = 60, T = A + Bw;
    let b = `<rect x="${o}" y="${o}" width="${A}" height="${A}" class="s-fill"/>`;
    b += `<rect x="${o + A}" y="${o}" width="${Bw}" height="${A}" class="s-soft s-line"/>`;
    b += `<rect x="${o}" y="${o + A}" width="${A}" height="${Bw}" class="s-soft s-line"/>`;
    b += `<rect x="${o + A}" y="${o + A}" width="${Bw}" height="${Bw}" class="s-soft2 s-line"/>`;
    b += `<rect x="${o}" y="${o}" width="${T}" height="${T}" class="s-line s-nofill"/>`;
    b += text(o + A / 2, o + A / 2 + 5, 'a²', { cls: 's-text s-bold' }) + text(o + A + Bw / 2, o + A / 2 + 5, 'ab') + text(o + A / 2, o + A + Bw / 2 + 5, 'ab') + text(o + A + Bw / 2, o + A + Bw / 2 + 5, 'b²');
    b += text(o + A / 2, o - 6, 'a') + text(o + A + Bw / 2, o - 6, 'b') + text(o - 10, o + A / 2 + 5, 'a') + text(o - 10, o + A + Bw / 2 + 5, 'b');
    b += line(o + A, o - 12, o + A, o - 2) + line(o - 18, o + A, o - 6, o + A);
    return svg(T + 40, T + 40, b);
  })();

  M.notion('identites-remarquables', {
    lesson: {
      retenir: `Pour tous nombres a et b :<ul>
        <li><b>(a + b)² = a² + 2ab + b²</b></li>
        <li><b>(a − b)² = a² − 2ab + b²</b></li>
        <li><b>(a + b)(a − b) = a² − b²</b></li></ul>
        Lues de gauche à droite, elles servent à <b>développer</b> ; de droite à gauche, à <b>factoriser</b>.`,
      explication: `${squareFig}<p>Un carré de côté a + b se découpe en un carré a², un carré b² et <b>deux</b> rectangles ab. Son aire est donc a² + 2ab + b² — et pas seulement a² + b² !</p>`,
      methode: [
        'Repère la forme : un carré d’une somme, un carré d’une différence, ou le produit d’une somme par une différence des mêmes termes.',
        'Identifie a et b (par exemple, dans (3<i>x</i> + 2)², a = 3<i>x</i> et b = 2).',
        'Applique la formule en calculant a², 2ab et b² séparément : (3<i>x</i>)² = 9<i>x</i>², 2 × 3<i>x</i> × 2 = 12<i>x</i>, 2² = 4.',
        'Pour factoriser, cherche deux carrés (et le double produit) dans l’expression.',
      ],
      exemples: [
        { q: 'Développe (<i>x</i> + 3)²', r: '<i>x</i>² + 2 × <i>x</i> × 3 + 3² = <b><i>x</i>² + 6<i>x</i> + 9</b>.' },
        { q: 'Calcule 49 × 51 de tête', r: '(50 − 1)(50 + 1) = 50² − 1² = 2 500 − 1 = <b>2 499</b>.' },
        { q: 'Factorise <i>x</i>² − 25', r: '<i>x</i>² − 5² = <b>(<i>x</i> − 5)(<i>x</i> + 5)</b>.' },
      ],
      astuces: ['101² = (100 + 1)² = 10 000 + 200 + 1 = 10 201 : pratique pour le calcul mental.', 'a² − b² se repère facilement : deux carrés séparés par un signe moins.'],
      erreurs: ['Écrire (a + b)² = a² + b² : avec a = 3 et b = 4, (3 + 4)² = 49 mais 3² + 4² = 25 !', 'Oublier le 2 du double produit : (<i>x</i> + 3)² ≠ <i>x</i>² + 3<i>x</i> + 9.'],
    },
    generate(level, rng) {
      if (level === 1) {
        if (rng.chance(0.5)) {
          const base = rng.pick([20, 30, 40, 50, 60, 70, 80, 90, 100]), d = rng.int(1, 3), plus = rng.chance(0.5);
          const n = plus ? base + d : base - d, r = n * n;
          return Q(`ir1s:${n}`, `Calcule ${n}² de tête, avec une identité remarquable.`, num(r), `Écris ${n} = ${base} ${plus ? '+' : '−'} ${d}.`,
            `${n}² = (${base} ${plus ? '+' : '−'} ${d})² = ${fmt(base * base)} ${plus ? '+' : '−'} 2 × ${base} × ${d} + ${d}² = ${fmt(base * base)} ${plus ? '+' : '−'} ${2 * base * d} + ${d * d} = <b>${fmt(r)}</b>`);
        }
        const m = rng.pick([20, 30, 40, 50, 60, 70, 80, 90]), d = rng.int(1, 9), r = m * m - d * d;
        return Q(`ir1p:${m}:${d}`, `Calcule ${m - d} × ${m + d} de tête, avec une identité remarquable.`, num(r), `Les deux nombres sont autour de ${m}.`,
          `${m - d} × ${m + d} = (${m} − ${d})(${m} + ${d}) = ${m}² − ${d}² = ${fmt(m * m)} − ${d * d} = <b>${fmt(r)}</b>`);
      }
      const a = level === 2 ? rng.pick([1, 1, 2, 3]) : rng.pick([1, 2, 3, 4, 5]), b = rng.int(1, 9);
      const kind = rng.pick(['plus', 'moins', 'diff']);
      if (level === 2) {
        let prompt, good, bads, why;
        if (kind === 'plus') {
          prompt = sq(lin(a, b)); good = poly(a * a, 2 * a * b, b * b);
          bads = [poly(a * a, 0, b * b), poly(a * a, a * b, b * b), poly(a * a, 2 * a * b, -b * b)];
          why = `(a + b)² = a² + 2ab + b² avec a = ${a === 1 ? '' : a}<i>x</i> et b = ${b}`;
        } else if (kind === 'moins') {
          prompt = sq(lin(a, b, '−')); good = poly(a * a, -2 * a * b, b * b);
          bads = [poly(a * a, 0, -b * b), poly(a * a, 2 * a * b, b * b), poly(a * a, -2 * a * b, -b * b)];
          why = `(a − b)² = a² − 2ab + b² avec a = ${a === 1 ? '' : a}<i>x</i> et b = ${b}`;
        } else {
          prompt = `(${lin(a, b)})(${lin(a, b, '−')})`; good = poly(a * a, 0, -b * b);
          bads = [poly(a * a, 0, b * b), poly(a * a, -2 * a * b, b * b), poly(a * a, 2 * a * b, -b * b)];
          why = `(a + b)(a − b) = a² − b² avec a = ${a === 1 ? '' : a}<i>x</i> et b = ${b}`;
        }
        return Q(`ir2:${kind}:${a}:${b}`, `Développe : ${prompt}`, choice(rng, good, bads), 'Quelle identité remarquable reconnais-tu ? Calcule a², 2ab et b² séparément.', `${why} : ${prompt} = <b>${good}</b>`);
      }
      if (rng.chance(0.3)) {
        // a² − b² with numbers: 57² − 43² = (57 − 43)(57 + 43).
        const s = rng.pick([100, 200, 50]), d = rng.int(1, 12) * 2, x = (s + d) / 2, y = (s - d) / 2, r = d * s;
        return Q(`ir3n:${x}:${y}`, `Calcule ${x}² − ${y}² astucieusement.`, num(r), 'C’est une différence de deux carrés.', `${x}² − ${y}² = (${x} − ${y})(${x} + ${y}) = ${d} × ${s} = <b>${fmt(r)}</b>`);
      }
      let expr, good, bads;
      if (kind === 'plus') { expr = poly(a * a, 2 * a * b, b * b); good = sq(lin(a, b)); bads = [sq(lin(a, b, '−')), `(${lin(a, b)})(${lin(a, b, '−')})`, sq(lin(a, 2 * b))]; }
      else if (kind === 'moins') { expr = poly(a * a, -2 * a * b, b * b); good = sq(lin(a, b, '−')); bads = [sq(lin(a, b)), `(${lin(a, b)})(${lin(a, b, '−')})`, sq(lin(a, 2 * b, '−'))]; }
      else { expr = poly(a * a, 0, -b * b); good = `(${lin(a, b, '−')})(${lin(a, b)})`; bads = [sq(lin(a, b, '−')), sq(lin(a, b)), `(${lin(a * a, b, '−')})(${lin(1, b)})`]; }
      return Q(`ir3:${kind}:${a}:${b}`, `Factorise : ${expr}`, choice(rng, good, bads), 'Cherche deux carrés, puis vérifie le terme du milieu (le double produit).', `${expr} = <b>${good}</b> (vérifie en développant).`);
    },
  });

  // ===================== AUTRES CRITÈRES DE DIVISIBILITÉ =====================
  const digits = n => String(n).split('').map(Number);
  const altSum = n => digits(n).reverse().reduce((s, d, i) => s + (i % 2 ? -d : d), 0);   // units +, tens −, …
  const altText = n => { const ds = digits(n).reverse(); return ds.map((d, i) => (i === 0 ? `${d}` : `${i % 2 ? '−' : '+'} ${d}`)).join(' '); };
  const RULES = {
    6: { test: n => n % 6 === 0, why: n => `${n % 2 === 0 ? 'il est pair' : 'il est impair'} et la somme de ses chiffres vaut ${digits(n).reduce((a, b) => a + b, 0)}${digits(n).reduce((a, b) => a + b, 0) % 3 === 0 ? ' (multiple de 3)' : ' (pas un multiple de 3)'}` },
    8: { test: n => n % 8 === 0, why: n => `ses trois derniers chiffres forment ${n % 1000}, et ${n % 1000} ${(n % 1000) % 8 === 0 ? '' : 'n’'}est ${(n % 1000) % 8 === 0 ? '' : 'pas '}divisible par 8` },
    11: { test: n => n % 11 === 0, why: n => `en alternant + et − depuis les unités : ${altText(n)} = ${altSum(n)}, ${altSum(n) % 11 === 0 ? '' : 'qui n’est pas '}un multiple de 11` },
    25: { test: n => n % 25 === 0, why: n => `il se termine par ${String(n % 100).padStart(2, '0')}` },
  };
  const yesNo = b => fixedChoice(['Oui', 'Non'], b ? 'Oui' : 'Non');
  // A number that is (or is not) divisible by d, of the given size.
  function sample(rng, d, yes, lo, hi) {
    for (;;) { const n = rng.int(lo, hi); if ((n % d === 0) === yes) return n; }
  }

  M.notion('criteres-autres', {
    lesson: {
      retenir: `Un nombre entier est divisible :<ul>
        <li>par <b>6</b> s’il est divisible <b>à la fois par 2 et par 3</b> ;</li>
        <li>par <b>8</b> si le nombre formé par ses <b>trois derniers chiffres</b> est divisible par 8 ;</li>
        <li>par <b>11</b> si, en partant des unités et en <b>alternant + et −</b>, la somme de ses chiffres est un multiple de 11 (0 compris) ;</li>
        <li>par <b>25</b> s’il se termine par <b>00, 25, 50 ou 75</b>.</li></ul>`,
      explication: '<p>Ces règles viennent de multiples faciles : 1 000 = 8 × 125, donc les milliers sont toujours divisibles par 8 et seuls les trois derniers chiffres comptent. De même, 100 = 4 × 25 explique la règle de 25. Pour 11 : 10 = 11 − 1 et 100 = 99 + 1, d’où l’alternance des signes.</p>',
      methode: [
        'Pour 6 : vérifie la parité (dernier chiffre), puis la somme des chiffres (règle de 3).',
        'Pour 8 : garde seulement les trois derniers chiffres et divise-les par 8.',
        'Pour 11 : en partant des unités, fais + − + − sur les chiffres ; le résultat doit être 0, 11, −11, 22…',
        'Pour 25 : regarde les deux derniers chiffres.',
      ],
      exemples: [
        { q: '2 754 est-il divisible par 6 ?', r: 'Il est pair, et 2 + 7 + 5 + 4 = 18 (multiple de 3) : <b>oui</b>.' },
        { q: '9 372 est-il divisible par 11 ?', r: '2 − 7 + 3 − 9 = −11, un multiple de 11 : <b>oui</b> (9 372 = 11 × 852).' },
        { q: '13 416 est-il divisible par 8 ?', r: '416 = 8 × 52 : <b>oui</b>.' },
      ],
      astuces: ['Un nombre divisible par 8 est aussi divisible par 4 et par 2.', 'Les nombres comme 11, 22, … 99, ou 121, 242, 363, sont tous des multiples de 11 : vérifie-le avec la règle des signes alternés.'],
      erreurs: ['Pour 6 : vérifier seulement la parité. 14 est pair mais pas divisible par 6.', 'Pour 8 : regarder seulement les deux derniers chiffres (c’est la règle de 4).'],
    },
    generate(level, rng) {
      if (level === 1) {
        const d = rng.pick([6, 25]), yes = rng.chance(0.5), n = sample(rng, d, yes, 100, 9999);
        return Q(`ca1:${n}:${d}`, `${fmt(n)} est-il divisible par ${d} ?`, yesNo(yes), d === 6 ? 'Divisible par 2 et par 3 ?' : 'Regarde les deux derniers chiffres.', `<b>${yes ? 'Oui' : 'Non'}</b> : ${RULES[d].why(n)}.`);
      }
      if (level === 2) {
        const d = rng.pick([8, 11, 6]);
        if (rng.chance(0.5)) {
          const yes = rng.chance(0.5), n = sample(rng, d, yes, 1000, 99999);
          return Q(`ca2:${n}:${d}`, `${fmt(n)} est-il divisible par ${d} ?`, yesNo(yes), { 8: 'Garde les trois derniers chiffres.', 11: 'Alterne + et − sur les chiffres, en partant des unités.', 6: 'Divisible par 2 et par 3 ?' }[d], `<b>${yes ? 'Oui' : 'Non'}</b> : ${RULES[d].why(n)}.`);
        }
        const good = sample(rng, d, true, 1000, 99999), bads = [];
        // For 6, the wrong answers are even numbers (the classic trap: even is not enough).
        while (bads.length < 3) { const x = sample(rng, d, false, 1000, 99999); if (!bads.includes(x) && (d !== 6 || x % 2 === 0)) bads.push(x); }
        return Q(`ca2c:${good}:${d}`, `Lequel de ces nombres est divisible par ${d} ?`, choice(rng, fmt(good), bads.map(fmt)), 'Applique le critère à chaque nombre.', `${fmt(good)} : ${RULES[d].why(good)} → <b>${fmt(good)}</b>.`);
      }
      // Missing digit: 11 (unique digit) or 6 (smallest digit).
      if (rng.chance(0.5)) {
        for (;;) {
          const n = sample(rng, 11, true, 10000, 99999), s = String(n), pos = rng.int(1, 3), dgt = Number(s[pos]);
          const options = [];
          for (let k = 0; k <= 9; k++) if (Number(s.slice(0, pos) + k + s.slice(pos + 1)) % 11 === 0) options.push(k);
          if (options.length !== 1) continue;
          const shown = `${s.slice(0, pos)}<span class="hole">?</span>${s.slice(pos + 1)}`;
          return Q(`ca3e:${n}:${pos}`, `Quel chiffre faut-il mettre à la place de ? pour que ${shown} soit divisible par 11 ?`, num(dgt), 'Alterne + et − sur les chiffres connus depuis les unités, puis cherche ce qui manque pour tomber sur un multiple de 11.', `Avec ${dgt} : ${altText(n)} = ${altSum(n)}, un multiple de 11. Le chiffre est <b>${dgt}</b>.`);
        }
      }
      for (;;) {
        const n = rng.int(1000, 99999) * 10 + rng.pick([0, 2, 4, 6, 8]), s = String(n), pos = rng.int(0, s.length - 2);
        const ok = []; for (let k = pos === 0 ? 1 : 0; k <= 9; k++) if (Number(s.slice(0, pos) + k + s.slice(pos + 1)) % 6 === 0) ok.push(k);
        if (!ok.length) continue;
        const shown = `${s.slice(0, pos)}<span class="hole">?</span>${s.slice(pos + 1)}`, best = ok[0], full = Number(s.slice(0, pos) + best + s.slice(pos + 1));
        return Q(`ca3s:${n}:${pos}`, `Quel est le plus petit chiffre à mettre à la place de ? pour que ${shown} soit divisible par 6 ?`, num(best), 'Le nombre est déjà pair : il faut que la somme des chiffres soit un multiple de 3.', `Avec ${best}, la somme des chiffres vaut ${digits(full).reduce((a, b) => a + b, 0)}, un multiple de 3, et le nombre est pair. Réponse : <b>${best}</b> (chiffres possibles : ${ok.join(', ')}).`);
      }
    },
  });

  // ===================== EXPLICATIONS =====================
  const B = M.cat.BASE;
  M.explain('identites-remarquables', [
    ['dessin', B],
    ['etapes', '<p>Pour développer (2<i>x</i> + 5)² :</p><ol><li>Je repère la forme (a + b)², avec a = 2<i>x</i> et b = 5.</li><li>a² = 4<i>x</i>², 2ab = 2 × 2<i>x</i> × 5 = 20<i>x</i>, b² = 25.</li><li>J’assemble : 4<i>x</i>² + 20<i>x</i> + 25.</li></ol>'],
    ['lien', '<p>C’est la double distributivité qui fait tout le travail : (a + b)² = (a + b)(a + b) = a × a + a × b + b × a + b × b = a² + 2ab + b². Les identités remarquables sont juste des raccourcis à connaître.</p>'],
    ['vie', '<p>Calcul mental de champion : 99² = (100 − 1)² = 10 000 − 200 + 1 = 9 801. Et 48 × 52 = (50 − 2)(50 + 2) = 2 500 − 4 = 2 496. Tu impressionneras tout le monde !</p>'],
  ]);
  M.explain('criteres-autres', [
    ['lien', B],
    ['etapes', '<p>Pour savoir si 9 372 est divisible par 11 :</p><ol><li>J’écris les chiffres depuis les unités : 2, 7, 3, 9.</li><li>J’alterne les signes : 2 − 7 + 3 − 9.</li><li>Je calcule : −11, un multiple de 11. Donc oui !</li></ol>'],
    ['vie', '<p>Des pièces de 25 centimes : on peut payer exactement un montant en centimes avec ces pièces seulement s’il se termine par 00, 25, 50 ou 75. 3,75 € = 375 centimes : oui (15 pièces) ; 3,80 € : non.</p>'],
  ]);
})();
