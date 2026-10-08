// Chapters "Opérations", "Expressions et distributivité", "Multiples et diviseurs".
(function () {
  'use strict';
  const M = globalThis.M;
  const { fmt, dec, decimals, mul, add, sub, div, round, divisors, range } = M.u;
  const { posee, hole, frac } = M.h;
  const { Q, num, choice, fixedChoice } = M.kit;

  // Column layout with aligned decimal commas (plain digits, monospace).
  function column(nums, op, result) {
    const k = Math.max(...nums.map(decimals), decimals(result));
    const s = x => (k ? x.toFixed(k).replace('.', ',') : String(x));
    const all = [...nums.map(s), s(result)];
    const w = Math.max(...all.map(t => t.length)) + 2;
    const rows = nums.map((x, i) => (i === 0 ? ' ' : op) + s(x).padStart(w - 1));
    return posee([...rows, '─'.repeat(w), ' ' + s(result).padStart(w - 1)]) + `<p>Résultat : <b>${fmt(result)}</b></p>`;
  }
  const roundSig = x => { const p = 10 ** Math.floor(Math.log10(Math.abs(x))); return round(Math.round(x / p) * p, 6); };

  // ===================== OPÉRATIONS =====================
  M.notion('ordre-grandeur', {
    lesson: {
      retenir: 'Un <b>ordre de grandeur</b> est un résultat approché, facile à calculer de tête, obtenu en remplaçant les nombres par des <b>nombres ronds</b> proches. Il sert à <b>prévoir</b> et à <b>vérifier</b> un résultat.',
      methode: [
        'Remplace chaque nombre par un nombre rond proche (48,7 → 50 ; 21,3 → 20).',
        'Calcule de tête avec ces nombres ronds (50 × 20 = 1 000).',
        'Compare avec ton résultat : s’il est très différent, il y a une erreur (souvent la virgule).',
      ],
      exemples: [
        { q: 'Ordre de grandeur de 398 + 612', r: '400 + 600 = <b>1 000</b>.' },
        { q: '23,8 × 4,1 vaut-il 97,58 ou 975,8 ?', r: 'Environ 24 × 4 ≈ 100, donc <b>97,58</b>.' },
      ],
      erreurs: ['Arrondir trop finement : le but est un calcul facile, pas précis.'],
    },
    generate(level, rng) {
      if (level === 3) {
        const a = dec(rng.int(110, 990), 1), b = dec(rng.int(21, 99), 1), r = mul(a, b);
        const opts = [r, mul(r, 10), div(r, 10), mul(r, 100)].map(fmt);
        return Q(`og3:${a}x${b}`, `Sans poser l’opération, quel est le résultat de ${fmt(a)} × ${fmt(b)} ?`, choice(rng, opts[0], opts.slice(1)), `Arrondis : ${fmt(a)} ≈ ${fmt(roundSig(a))} et ${fmt(b)} ≈ ${fmt(roundSig(b))}.`, `${fmt(roundSig(a))} × ${fmt(roundSig(b))} = ${fmt(mul(roundSig(a), roundSig(b)))}, donc le résultat est <b>${fmt(r)}</b>.`);
      }
      const isMul = level === 2;
      const a = isMul ? dec(rng.int(110, 990), 1) : rng.int(110, 990), b = isMul ? rng.int(11, 99) : rng.int(110, 990);
      const ra = roundSig(a), rb = roundSig(b), est = isMul ? mul(ra, rb) : add(ra, rb);
      const opt = [est, mul(est, 10), roundSig(div(est, 10) || est / 10), isMul ? add(ra, rb) : mul(est, 100)].map(fmt);
      const op = isMul ? '×' : '+';
      return Q(`og:${a}${op}${b}`, `Quel est le meilleur ordre de grandeur de ${fmt(a)} ${op} ${fmt(b)} ?`, choice(rng, opt[0], opt.slice(1)), 'Remplace chaque nombre par un nombre rond proche.', `${fmt(a)} ≈ ${fmt(ra)} et ${fmt(b)} ≈ ${fmt(rb)}, donc ${fmt(ra)} ${op} ${fmt(rb)} = <b>${fmt(est)}</b>.`);
    },
  });

  M.notion('add-sous', {
    lesson: {
      retenir: 'Pour additionner ou soustraire des décimaux en les posant, on <b>aligne les virgules</b> (donc les unités sous les unités, les dixièmes sous les dixièmes…). On peut compléter avec des zéros.',
      explication: column([12.5, 3.47], '+', 15.97),
      methode: [
        'Écris les nombres l’un sous l’autre, virgule sous virgule.',
        'Complète avec des zéros pour avoir le même nombre de chiffres après la virgule.',
        'Calcule comme avec des entiers, de droite à gauche, sans oublier les retenues. Place la virgule du résultat sous les autres.',
      ],
      exemples: [
        { q: '15 − 2,36', r: `${column([15, 2.36], '−', 12.64)}15 s’écrit 15,00.` },
        { q: '3,7 + 0,45', r: column([3.7, 0.45], '+', 4.15) },
      ],
      astuces: ['Vérifie une soustraction par une addition : 12,64 + 2,36 = 15.'],
      erreurs: ['Aligner les chiffres à droite au lieu des virgules : 12,5 + 3,47 ≠ 1,597.'],
    },
    generate(level, rng) {
      const d = () => dec(rng.int(10, 9999), rng.int(1, 2));
      if (level === 1) {
        const a = dec(rng.int(10, 999), 1), b = dec(rng.int(10, 999), 1);
        if (rng.chance(0.5)) return Q(`as:${a}+${b}`, `${fmt(a)} + ${fmt(b)} = ?`, num(add(a, b)), 'Aligne les virgules.', column([a, b], '+', add(a, b)));
        const [x, y] = a > b ? [a, b] : [b, a];
        return Q(`as:${x}-${y}`, `${fmt(x)} − ${fmt(y)} = ?`, num(sub(x, y)), 'Aligne les virgules.', column([x, y], '−', sub(x, y)));
      }
      if (level === 2) {
        const a = d(), b = rng.chance(0.3) ? rng.int(2, 99) : d();
        if (rng.chance(0.5)) return Q(`as:${a}+${b}`, `${fmt(a)} + ${fmt(b)} = ?`, num(add(a, b)), 'Complète avec des zéros pour avoir autant de décimales.', column([a, b], '+', add(a, b)));
        const [x, y] = a > b ? [a, b] : [b, a];
        return Q(`as:${x}-${y}`, `${fmt(x)} − ${fmt(y)} = ?`, num(sub(x, y)), 'Complète avec des zéros pour avoir autant de décimales.', column([x, y], '−', sub(x, y)));
      }
      const t = rng.int(0, 2);
      if (t === 0) {
        const a = rng.int(2, 9) * 10, b = dec(rng.int(101, a * 100 - 1), 2);
        return Q(`as:${a}-${b}`, `${fmt(a)} − ${fmt(b)} = ?`, num(sub(a, b)), `${fmt(a)} = ${a},00`, column([a, b], '−', sub(a, b)));
      }
      if (t === 1) {
        const a = d(), r = add(a, d());
        return Q(`asm:${a}:${r}`, `${fmt(a)} + ${hole} = ${fmt(r)}`, num(sub(r, a)), `Calcule ${fmt(r)} − ${fmt(a)}.`, `On cherche ${fmt(r)} − ${fmt(a)} :${column([r, a], '−', sub(r, a))}`);
      }
      const a = d(), b = d(), c = d(), r = add(add(a, b), c);
      return Q(`as3:${a}+${b}+${c}`, `${fmt(a)} + ${fmt(b)} + ${fmt(c)} = ?`, num(r), 'Aligne toutes les virgules.', column([a, b, c], '+', r));
    },
  });

  M.notion('mult-dec', {
    lesson: {
      retenir: 'Pour multiplier des décimaux : on multiplie <b>sans s’occuper des virgules</b>, puis on place la virgule pour que le résultat ait <b>autant de chiffres après la virgule</b> que les deux facteurs réunis.',
      explication: `<p>2,3 × 1,2 : on calcule 23 × 12 = 276. Il y a 1 + 1 = 2 chiffres après la virgule dans les facteurs, donc 2,3 × 1,2 = <b>2,76</b>.</p><p>Pourquoi ? 2,3 = 23 ÷ 10 et 1,2 = 12 ÷ 10, donc le produit est 276 ÷ 100.</p>`,
      methode: [
        'Pose la multiplication sans aligner les virgules (on aligne à droite).',
        'Calcule comme avec des entiers.',
        'Compte le nombre total de chiffres après la virgule dans les deux facteurs et place la virgule dans le résultat.',
        'Vérifie avec un ordre de grandeur (2,3 × 1,2 ≈ 2 × 1 = 2).',
      ],
      exemples: [
        { q: '2,5 × 4', r: '25 × 4 = 100 ; 1 chiffre après la virgule → 10,0 = <b>10</b>.' },
        { q: '0,3 × 0,2', r: '3 × 2 = 6 ; 2 chiffres après la virgule → <b>0,06</b>.' },
        { q: 'Sachant que 37 × 24 = 888, calcule 3,7 × 2,4', r: '2 chiffres après la virgule → <b>8,88</b>.' },
      ],
      erreurs: [
        'Aligner les virgules comme pour l’addition : inutile pour la multiplication.',
        '0,3 × 0,2 = 0,6 : FAUX, c’est 0,06.',
      ],
    },
    generate(level, rng) {
      let a, b;
      if (level === 1) { a = dec(rng.int(11, 99), 1); b = rng.int(2, 9); }
      else if (level === 2) { a = dec(rng.int(1, 99), rng.int(1, 2)); b = dec(rng.int(2, 9), 1); }
      else {
        if (rng.chance(0.5)) {
          const x = rng.int(12, 99), y = rng.int(12, 99), ka = rng.int(0, 2), kb = rng.int(1, 2), r = mul(dec(x, ka), dec(y, kb));
          return Q(`md3:${x}:${y}:${ka}:${kb}`, `Sachant que ${x} × ${y} = ${fmt(x * y)}, calcule ${fmt(dec(x, ka))} × ${fmt(dec(y, kb))}.`, num(r), 'Compte les chiffres après la virgule dans les deux facteurs.', `${ka + kb} chiffre(s) après la virgule : <b>${fmt(r)}</b>.`);
        }
        a = dec(rng.int(101, 999), 1); b = dec(rng.int(11, 99), 1);
      }
      const r = mul(a, b), ia = Math.round(a * 10 ** decimals(a)), ib = Math.round(b * 10 ** decimals(b)), k = decimals(a) + decimals(b);
      return Q(`md:${a}x${b}`, `${fmt(a)} × ${fmt(b)} = ?`, num(r), `Calcule ${ia} × ${ib}, puis place la virgule.`, `${ia} × ${ib} = ${fmt(ia * ib)} ; ${k} chiffre(s) après la virgule → <b>${fmt(r)}</b>.`);
    },
  });

  M.notion('div-euclide', {
    lesson: {
      retenir: 'Faire la <b>division euclidienne</b> de a par b, c’est trouver le <b>quotient</b> q et le <b>reste</b> r tels que : <b>a = b × q + r</b> avec <b>r &lt; b</b>.',
      explication: `<p>75 œufs rangés par boîtes de 6 : 75 = 6 × 12 + 3. On remplit <b>12</b> boîtes (le quotient) et il reste <b>3</b> œufs (le reste). Le reste est toujours plus petit que le diviseur, sinon on pourrait remplir une boîte de plus !</p>`,
      methode: [
        'Cherche dans la table du diviseur le plus grand multiple qui ne dépasse pas le nombre (pour les grands nombres, procède chiffre par chiffre en posant la division).',
        'Ce multiple donne le quotient ; la différence donne le reste.',
        'Vérifie : diviseur × quotient + reste = dividende, et reste &lt; diviseur.',
      ],
      exemples: [
        { q: '47 divisé par 5', r: '5 × 9 = 45 et 47 − 45 = 2 → quotient <b>9</b>, reste <b>2</b> (47 = 5 × 9 + 2).' },
        { q: '317 divisé par 12', r: '12 × 26 = 312 et 317 − 312 = 5 → quotient <b>26</b>, reste <b>5</b>.' },
      ],
      erreurs: ['Un reste plus grand que le diviseur : c’est que le quotient est trop petit.'],
    },
    generate(level, rng) {
      const b = level === 1 ? rng.int(2, 9) : level === 2 ? rng.int(3, 9) : rng.int(11, 25);
      const q = level === 1 ? rng.int(2, 10) : level === 2 ? rng.int(12, 150) : rng.int(12, 99);
      const r = rng.int(0, b - 1), a = b * q + r;
      return Q(`de:${a}/${b}`, `Division euclidienne de <b>${fmt(a)}</b> par <b>${b}</b> : quotient et reste ?`, { kind: 'division', q, r }, `Cherche le plus grand multiple de ${b} qui ne dépasse pas ${fmt(a)}.`, `${fmt(a)} = ${b} × ${fmt(q)} + ${r} et ${r} &lt; ${b} : quotient <b>${fmt(q)}</b>, reste <b>${r}</b>.`);
    },
  });

  M.notion('div-dec', {
    lesson: {
      retenir: 'Dans une division décimale, on continue la division après la virgule en ajoutant des zéros au dividende (7 = 7,0 = 7,00…). Quand on « abaisse » le premier chiffre après la virgule, on place la <b>virgule au quotient</b>.',
      explication: `<p>7 ÷ 4 : 7 = 4 × 1 + 3. On continue : 3 unités = 30 dixièmes ; 30 ÷ 4 = 7 reste 2 ; 2 dixièmes = 20 centièmes ; 20 ÷ 4 = 5 reste 0. Donc 7 ÷ 4 = <b>1,75</b>.</p><p>Certaines divisions ne s’arrêtent jamais (10 ÷ 3 = 3,333…) : on donne alors une <b>valeur approchée</b> (arrondi).</p>`,
      methode: [
        'Divise la partie entière.',
        'Au moment d’abaisser le chiffre des dixièmes, place la virgule au quotient.',
        'Continue en ajoutant des zéros jusqu’à un reste nul ou jusqu’à la précision demandée.',
      ],
      exemples: [
        { q: '8,4 ÷ 4', r: '8 ÷ 4 = 2, puis 4 dixièmes ÷ 4 = 1 dixième → <b>2,1</b>.' },
        { q: '13 ÷ 8', r: '13 = 8 × 1 + 5 ; 50 ÷ 8 = 6 r 2 ; 20 ÷ 8 = 2 r 4 ; 40 ÷ 8 = 5 → <b>1,625</b>.' },
        { q: 'Arrondi au dixième de 10 ÷ 3', r: '10 ÷ 3 = 3,33… → <b>3,3</b>.' },
      ],
      erreurs: ['Oublier la virgule au quotient : 8,4 ÷ 4 = 21 est absurde (ordre de grandeur : environ 2).'],
    },
    generate(level, rng) {
      if (level === 1) {
        const b = rng.int(2, 9), q = dec(rng.int(11, 999), rng.int(1, 2)), a = mul(q, b);
        return Q(`dd:${a}/${b}`, `${fmt(a)} ÷ ${b} = ?`, num(q), 'Place la virgule au quotient quand tu abaisses les dixièmes.', `${fmt(a)} ÷ ${b} = <b>${fmt(q)}</b> (vérification : ${fmt(q)} × ${b} = ${fmt(a)}).`);
      }
      if (level === 2) {
        const b = rng.pick([4, 5, 8, 20, 25]);
        let a;
        do a = rng.int(3, 99); while (a % b === 0);
        const q = div(a, b);
        return Q(`dd:${a}/${b}`, `${a} ÷ ${b} = ? <small>(valeur exacte)</small>`, num(q), `Écris ${a} = ${a},000 et continue après la virgule.`, `${a} ÷ ${b} = <b>${fmt(q)}</b> (vérification : ${fmt(q)} × ${b} = ${a}).`);
      }
      const b = rng.pick([3, 6, 7, 9, 11]), k = rng.int(1, 2);
      let a;
      do a = rng.int(2, 99); while (div(a, b, 4) !== null);
      const q = Math.round((a * 10 ** k) / b) / 10 ** k;
      const lab = k === 1 ? 'au dixième' : 'au centième';
      const approx = (Math.floor((a * 10 ** (k + 2)) / b) / 10 ** (k + 2));
      return Q(`dd3:${a}/${b}:${k}`, `Arrondi ${lab} de ${a} ÷ ${b} ?`, num(q), `Calcule un chiffre de plus que demandé, puis arrondis.`, `${a} ÷ ${b} = ${fmt(approx)}… donc l’arrondi ${lab} est <b>${fmt(q)}</b>.`);
    },
  });

  // ===================== EXPRESSIONS =====================
  // Each template returns { expr, value, steps } using small positive integers.
  const exprTemplates = {
    1: [
      r => { const a = r.int(2, 30), b = r.int(2, 9), c = r.int(2, 9); return { expr: `${a} + ${b} × ${c}`, value: a + b * c, steps: [`${a} + ${b * c}`, `${a + b * c}`] }; },
      r => { const b = r.int(2, 9), c = r.int(2, 9), a = b * c + r.int(1, 30); return { expr: `${a} − ${b} × ${c}`, value: a - b * c, steps: [`${a} − ${b * c}`, `${a - b * c}`] }; },
      r => { const a = r.int(2, 9), b = r.int(2, 9), c = r.int(2, 9), d = r.int(2, 9); return { expr: `${a} × ${b} + ${c} × ${d}`, value: a * b + c * d, steps: [`${a * b} + ${c * d}`, `${a * b + c * d}`] }; },
      r => { const c = r.int(2, 9), b = c * r.int(2, 9), a = r.int(2, 40); return { expr: `${a} + ${b} ÷ ${c}`, value: a + b / c, steps: [`${a} + ${b / c}`, `${a + b / c}`] }; },
    ],
    2: [
      r => { const a = r.int(2, 15), b = r.int(2, 15), c = r.int(2, 9); return { expr: `(${a} + ${b}) × ${c}`, value: (a + b) * c, steps: [`${a + b} × ${c}`, `${(a + b) * c}`] }; },
      r => { const c = r.int(2, 9), b = c + r.int(1, 9), a = r.int(2, 9); return { expr: `${a} × (${b} − ${c})`, value: a * (b - c), steps: [`${a} × ${b - c}`, `${a * (b - c)}`] }; },
      r => { const b = r.int(2, 20), c = r.int(2, 20), a = b + c + r.int(1, 30); return { expr: `${a} − (${b} + ${c})`, value: a - b - c, steps: [`${a} − ${b + c}`, `${a - b - c}`] }; },
      r => { const c = r.int(2, 9), s = c * r.int(2, 9), a = r.int(1, s - 1), b = s - a; return { expr: `(${a} + ${b}) ÷ ${c}`, value: s / c, steps: [`${s} ÷ ${c}`, `${s / c}`] }; },
      r => { const a = r.int(10, 40), b = r.int(2, 9), c = r.int(2, 9), d = r.int(2, 9); return { expr: `${a} + ${b} × ${c} − ${d}`, value: a + b * c - d, steps: [`${a} + ${b * c} − ${d}`, `${a + b * c} − ${d}`, `${a + b * c - d}`] }; },
    ],
    3: [
      r => { const a = r.int(2, 9), b = r.int(2, 9), c = r.int(2, 9), d = r.int(2, 9); return { expr: `${a} × (${b} + ${c} × ${d})`, value: a * (b + c * d), steps: [`${a} × (${b} + ${c * d})`, `${a} × ${b + c * d}`, `${a * (b + c * d)}`] }; },
      r => { const a = r.int(2, 9), b = r.int(2, 9), c = r.int(2, 9), d = r.int(2, 9); return { expr: `(${a} + ${b}) × (${c} + ${d})`, value: (a + b) * (c + d), steps: [`${a + b} × ${c + d}`, `${(a + b) * (c + d)}`] }; },
      r => { const b = r.int(2, 9), c = r.int(2, 9), d = r.int(2, 6), a = (b * c) + d * r.int(2, 9); return { expr: `${a} − ${b} × ${c} + ${d}`, value: a - b * c + d, steps: [`${a} − ${b * c} + ${d}`, `${a - b * c} + ${d}`, `${a - b * c + d}`] }; },
      r => { const d = r.int(2, 5), c = r.int(2, 9), b = r.int(2, 9), a = d * (b + c) + r.int(1, 30); return { expr: `${a} − ${d} × (${b} + ${c})`, value: a - d * (b + c), steps: [`${a} − ${d} × ${b + c}`, `${a} − ${d * (b + c)}`, `${a - d * (b + c)}`] }; },
      r => { const c = r.int(2, 9), q = r.int(2, 9), b = c * q, a = r.int(2, 9), e = r.int(1, 9); return { expr: `${a} × ${b} ÷ ${c} + ${e}`, value: a * q + e, steps: [`${a * b} ÷ ${c} + ${e}`, `${a * q} + ${e}`, `${a * q + e}`] }; },
    ],
  };

  M.notion('priorites', {
    lesson: {
      retenir: 'Dans un calcul sans parenthèses, on effectue <b>d’abord les multiplications et les divisions</b>, <b>puis les additions et les soustractions</b>, de gauche à droite. S’il y a des <b>parenthèses</b>, on commence par calculer ce qu’il y a dedans.',
      methode: [
        'Repère les parenthèses : calcule d’abord l’intérieur.',
        'Ensuite, fais les × et les ÷.',
        'Enfin, fais les + et les − de gauche à droite.',
        'Recopie le calcul à chaque étape en remplaçant ce que tu as calculé.',
      ],
      exemples: [
        { q: '5 + 3 × 4', r: '5 + 12 = <b>17</b> (et pas 8 × 4 = 32 !).' },
        { q: '(5 + 3) × 4', r: '8 × 4 = <b>32</b>.' },
        { q: '20 − 6 + 2', r: 'De gauche à droite : 14 + 2 = <b>16</b>.' },
      ],
      erreurs: [
        'Calculer de gauche à droite sans tenir compte des priorités : 5 + 3 × 4 ≠ 32.',
        '20 − 6 + 2 ≠ 20 − 8 : sans parenthèses, + et − se font de gauche à droite.',
      ],
    },
    generate(level, rng) {
      const t = rng.pick(exprTemplates[level])(rng);
      const corr = [t.expr, ...t.steps].map((s, i, a) => (i === a.length - 1 ? `= <b>${s}</b>` : (i ? `= ${s}` : s))).join('<br>');
      return Q(`prio:${t.expr}`, `${t.expr} = ?`, num(t.value), 'D’abord les parenthèses, puis × et ÷, puis + et −.', `<div class="calc">${corr}</div>`);
    },
  });

  M.notion('distributivite', {
    lesson: {
      retenir: `La multiplication est <b>distributive</b> sur l’addition et la soustraction :<br><b>k × (a + b) = k × a + k × b</b> &nbsp;et&nbsp; <b>k × (a − b) = k × a − k × b</b>.<br>Passer de la gauche à la droite, c’est <b>développer</b>.`,
      explication: `<p>Un rectangle de largeur 7 et de longueur 100 + 2 a pour aire 7 × 102. On peut aussi le couper en deux rectangles :</p>${M.svg.areaModel(7, 100, 2)}<p>7 × 102 = 7 × 100 + 7 × 2 = 700 + 14 = <b>714</b>.</p>`,
      methode: [
        'Décompose le nombre difficile en un nombre rond + ou − un petit nombre (102 = 100 + 2 ; 98 = 100 − 2).',
        'Multiplie chaque morceau par k.',
        'Additionne (ou soustrais) les deux produits.',
      ],
      exemples: [
        { q: '8 × 99', r: '8 × (100 − 1) = 800 − 8 = <b>792</b>.' },
        { q: '25 × 12', r: '25 × (10 + 2) = 250 + 50 = <b>300</b>.' },
        { q: '6 × 10,1', r: '6 × (10 + 0,1) = 60 + 0,6 = <b>60,6</b>.' },
      ],
      astuces: ['Les astuces ×9, ×11, ×99 viennent de la distributivité : × 9 = × (10 − 1).'],
      erreurs: ['Ne multiplier que le premier terme : 7 × (100 + 2) ≠ 700 + 2. Le facteur 7 multiplie <b>chaque</b> terme.'],
    },
    generate(level, rng) {
      const k = level === 1 ? rng.int(3, 9) : rng.int(3, 25);
      let base, d, op;
      if (level === 1) { base = rng.pick([10, 20, 100]); d = rng.int(1, 5); op = '+'; }
      else if (level === 2) { base = rng.pick([10, 100, 1000]); d = rng.int(1, 3); op = rng.pick(['+', '−']); }
      else { base = rng.pick([10, 100]); d = rng.pick([0.1, 0.2, 0.5, 1, 2]); op = rng.pick(['+', '−']); }
      const n = op === '+' ? add(base, d) : sub(base, d);
      const r = mul(k, n), p1 = k * base, p2 = mul(k, d);
      return Q(`dist:${k}x${n}`, `Calcule astucieusement : ${k} × ${fmt(n)}`, num(r), `${fmt(n)} = ${fmt(base)} ${op} ${fmt(d)}`, `${k} × ${fmt(n)} = ${k} × (${fmt(base)} ${op} ${fmt(d)}) = ${fmt(p1)} ${op} ${fmt(p2)} = <b>${fmt(r)}</b>`);
    },
  });

  M.notion('factoriser', {
    lesson: {
      retenir: `On peut utiliser la distributivité « à l’envers » : <b>k × a + k × b = k × (a + b)</b>. C’est <b>factoriser</b> : on met le facteur commun k en évidence.`,
      methode: [
        'Repère le facteur qui apparaît dans les deux produits (le facteur commun).',
        'Écris-le une seule fois, multiplié par la somme (ou la différence) des autres facteurs.',
        'La somme donne souvent un nombre rond : le calcul devient facile.',
      ],
      exemples: [
        { q: '7 × 13 + 7 × 7', r: '7 × (13 + 7) = 7 × 20 = <b>140</b>.' },
        { q: '8 × 57 − 8 × 47', r: '8 × (57 − 47) = 8 × 10 = <b>80</b>.' },
        { q: '99 × 23 + 23', r: '23 = 1 × 23, donc 23 × (99 + 1) = 23 × 100 = <b>2 300</b>.' },
      ],
      erreurs: ['Oublier que « + 23 » c’est « + 1 × 23 » : 99 × 23 + 23 = 23 × 100, pas 23 × 99.'],
    },
    generate(level, rng) {
      if (level === 3 && rng.chance(0.4)) {
        const a = rng.int(12, 89), k = rng.pick([9, 99, 19, 49]);
        return Q(`fact1:${k}x${a}`, `Calcule astucieusement : ${k} × ${a} + ${a}`, num((k + 1) * a), `${a} = 1 × ${a}`, `${k} × ${a} + 1 × ${a} = ${a} × (${k} + 1) = ${a} × ${k + 1} = <b>${fmt((k + 1) * a)}</b>`);
      }
      const k = level === 3 ? dec(rng.int(11, 99), 1) : rng.int(3, level === 1 ? 9 : 25);
      const total = rng.pick(level === 1 ? [10, 20, 100] : [10, 100, 1000]);
      const op = level === 1 ? '+' : rng.pick(['+', '−']);
      let a, b;
      if (op === '+') { a = rng.int(1, total - 1); b = total - a; } else { b = rng.int(2, 89); a = b + total; }
      const r = mul(k, total);
      return Q(`fact:${k}:${a}${op}${b}`, `Calcule astucieusement : ${fmt(k)} × ${a} ${op} ${fmt(k)} × ${b}`, num(r), `Le facteur commun est ${fmt(k)}.`, `${fmt(k)} × (${a} ${op} ${b}) = ${fmt(k)} × ${fmt(total)} = <b>${fmt(r)}</b>`);
    },
  });

  // ===================== MULTIPLES & DIVISEURS =====================
  const yesNo = (b) => fixedChoice(['Oui', 'Non'], b ? 'Oui' : 'Non');

  M.notion('multiples', {
    lesson: {
      retenir: 'Si <b>a = b × k</b> (k entier), on dit que <b>a est un multiple de b</b>, et que <b>b est un diviseur de a</b> (ou que a est divisible par b). Autrement dit : le reste de la division de a par b est <b>0</b>.',
      explication: '<p>42 = 6 × 7 : 42 est un multiple de 6 et de 7 ; 6 et 7 sont des diviseurs de 42.</p><p>Les diviseurs de 12 : 1, 2, 3, 4, 6, 12 (on les trouve par paires : 1 × 12, 2 × 6, 3 × 4).</p>',
      methode: [
        'Pour savoir si a est un multiple de b : cherche a dans la table de b, ou fais la division euclidienne et regarde si le reste est 0.',
        'Pour trouver tous les diviseurs : teste 1, 2, 3… et note les paires (d et a ÷ d). Arrête-toi quand les paires se croisent.',
      ],
      exemples: [
        { q: '56 est-il un multiple de 8 ?', r: '<b>Oui</b> : 56 = 8 × 7.' },
        { q: 'Diviseurs de 18', r: '1 × 18, 2 × 9, 3 × 6 → <b>1, 2, 3, 6, 9, 18</b>.' },
      ],
      erreurs: ['Confondre multiple et diviseur : 6 est un <b>diviseur</b> de 42 ; 42 est un <b>multiple</b> de 6.'],
    },
    generate(level, rng) {
      if (level === 1) {
        const b = rng.int(3, 9), yes = rng.chance(0.5), a = b * rng.int(3, 12) + (yes ? 0 : rng.int(1, b - 1));
        return Q(`mul:${a}:${b}`, `${a} est-il un multiple de ${b} ?`, yesNo(yes), `Cherche ${a} dans la table de ${b}.`, yes ? `<b>Oui</b> : ${a} = ${b} × ${a / b}.` : `<b>Non</b> : ${a} = ${b} × ${Math.floor(a / b)} + ${a % b}, le reste n’est pas 0.`);
      }
      if (level === 2) {
        if (rng.chance(0.5)) {
          const b = rng.int(6, 13), lim = rng.int(40, 120), r = (Math.floor(lim / b) + 1) * b;
          return Q(`pmult:${b}:${lim}`, `Quel est le plus petit multiple de ${b} strictement supérieur à ${lim} ?`, num(r), `${lim} = ${b} × … + …`, `${lim} = ${b} × ${Math.floor(lim / b)} + ${lim % b}, le multiple suivant est ${b} × ${Math.floor(lim / b) + 1} = <b>${r}</b>.`);
        }
        const a = rng.pick([12, 18, 20, 24, 28, 30, 36, 40, 42, 45, 48, 50, 60]), ds = divisors(a);
        return Q(`ndiv:${a}`, `Combien ${a} a-t-il de diviseurs ?`, num(ds.length), 'Cherche les paires : 1 × …, 2 × …, 3 × …', `Diviseurs de ${a} : ${ds.join(', ')} → <b>${ds.length}</b> diviseurs.`);
      }
      const a = rng.pick([24, 36, 48, 60, 72, 84, 90, 96]), ds = divisors(a).filter(d => d > 1 && d < a);
      const non = range(4, 20).filter(d => a % d !== 0);
      const bad = rng.pick(non), good = rng.sample(ds, 3);
      const ans = choice(rng, String(bad), good.map(String));
      return Q(`notdiv:${a}:${bad}`, `Lequel de ces nombres n’est <b>pas</b> un diviseur de ${a} ?`, ans, 'Teste chaque nombre : la division tombe-t-elle juste ?', `${a} ÷ ${bad} ne tombe pas juste (reste ${a % bad}) : <b>${bad}</b> n’est pas un diviseur de ${a}.`);
    },
  });

  const digitSum = n => String(n).split('').reduce((s, c) => s + Number(c), 0);
  const divReason = (n, d) => {
    if (d === 2) return `son chiffre des unités est ${n % 10}${n % 2 ? ' (impair)' : ' (pair)'}`;
    if (d === 5) return `son chiffre des unités est ${n % 10}`;
    if (d === 10) return `son chiffre des unités est ${n % 10}`;
    return `la somme de ses chiffres est ${String(n).split('').join(' + ')} = ${digitSum(n)}`;
  };

  M.notion('divisibilite', {
    lesson: {
      retenir: `Un nombre entier est divisible :<ul>
        <li>par <b>2</b> si son chiffre des unités est 0, 2, 4, 6 ou 8 (nombre pair) ;</li>
        <li>par <b>5</b> si son chiffre des unités est 0 ou 5 ;</li>
        <li>par <b>10</b> si son chiffre des unités est 0 ;</li>
        <li>par <b>3</b> si la <b>somme de ses chiffres</b> est divisible par 3 ;</li>
        <li>par <b>9</b> si la <b>somme de ses chiffres</b> est divisible par 9.</li></ul>`,
      methode: [
        'Pour 2, 5 et 10 : regarde seulement le chiffre des unités.',
        'Pour 3 et 9 : additionne tous les chiffres, puis regarde si cette somme est dans la table de 3 (ou de 9).',
      ],
      exemples: [
        { q: '1 236 est-il divisible par 3 ? par 9 ?', r: '1 + 2 + 3 + 6 = 12. 12 est divisible par 3 mais pas par 9 → divisible par <b>3</b>, pas par 9.' },
        { q: '4 095 est-il divisible par 5 ?', r: '<b>Oui</b>, il se termine par 5.' },
      ],
      astuces: ['Un nombre divisible par 9 est toujours divisible par 3 (mais pas l’inverse).', 'Divisible par 10 = divisible par 2 et par 5.'],
      erreurs: ['Pour 3 : regarder le chiffre des unités. 13 se termine par 3 mais n’est pas divisible par 3 !'],
    },
    generate(level, rng) {
      if (level === 3) {
        const d = rng.pick([3, 9]);
        let good;
        do good = rng.int(100, 9999); while (good % d !== 0);
        const bads = [];
        while (bads.length < 3) { const x = rng.int(100, 9999); if (x % d !== 0 && !bads.includes(x)) bads.push(x); }
        return Q(`div3:${d}:${good}`, `Lequel de ces nombres est divisible par ${d} ?`, choice(rng, fmt(good), bads.map(fmt)), 'Calcule la somme des chiffres de chaque nombre.', `Pour ${fmt(good)}, ${divReason(good, d)}, qui est divisible par ${d} → <b>${fmt(good)}</b>.`);
      }
      const d = level === 1 ? rng.pick([2, 5, 10]) : rng.pick([3, 9]);
      const n = rng.int(100, level === 1 ? 999 : 9999), yes = n % d === 0;
      return Q(`dv:${n}:${d}`, `${fmt(n)} est-il divisible par ${d} ?`, yesNo(yes), d >= 3 ? 'Calcule la somme des chiffres.' : 'Regarde le chiffre des unités.', `<b>${yes ? 'Oui' : 'Non'}</b> : ${divReason(n, d)}.`);
    },
  });
})();
